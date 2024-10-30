const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// const register = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//
//         // Vérifier si l'utilisateur existe déjà
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ msg: 'User already exists' });
//         }
//
//         // Créer un nouvel utilisateur
//         user = new User({ name, email, password });
//         await user.save();
//
//         // Retourner l'objet utilisateur créé (sans le mot de passe)
//         res.status(201).json({
//             id: user._id,
//             name: user.name,
//             email: user.email
//
//         });
//     } catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };



const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email });
        if (user) {
            // Supprimer le fichier uploadé si l'utilisateur existe déjà
            if (req.file) {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Créer un nouvel utilisateur avec la photo si elle existe
        const userData = {
            name,
            email,
            password
        };

        // Ajouter le chemin de la photo si une photo a été uploadée
        if (req.file) {
            userData.photo = req.file.path.replace(/\\/g, '/');

        }

        user = new User(userData);
        await user.save();

        // Générer un token JWT pour l'authentification automatique
        const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

        // Retourner l'objet utilisateur créé (sans le mot de passe) avec le token
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            photo: user.photo, // Utiliser le champ photo au lieu de profilePhoto
            token
        });
    } catch (error) {
        // Si une erreur survient, supprimer la photo uploadée
        if (req.file) {
            const fs = require('fs');
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ msg: error.message });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,  // Utilisation de la variable d'environnement
            { expiresIn: '2h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const refresh = async (req, res) => {
    try {
        const { userId } = req.body;

        const newAccessToken = jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
}

// console.log('Email User:', process.env.EMAIL_USER);
// console.log('Email Password:', process.env.EMAIL_PASSWORD);


// Configuration du transporteur d'email pour Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true pour le port 465, false pour les autres ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Fonction pour vérifier la configuration
const verifyTransporter = async () => {
    try {
        await transporter.verify();
        console.log('Configuration du serveur SMTP réussie');
    } catch (error) {
        console.error('Erreur de configuration SMTP:', error);
        throw error;
    }
};

// Appeler la vérification au démarrage
verifyTransporter();

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Générer un token de réinitialisation
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Sauvegarder le token dans la base de données
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();

        // Créer le lien de réinitialisation
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Configuration de l'email
        const mailOptions = {
            from: {
                name: 'RED PRODUCT',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Réinitialisation de votre mot de passe - RED PRODUCT',
            html: `
                <h1>Réinitialisation de mot de passe</h1>
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
                <a href="${resetLink}" style="
                    padding: 10px 20px;
                    background-color: #464646;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                    margin: 20px 0;
                ">Réinitialiser mon mot de passe</a>
                <p>Ce lien expirera dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                <p>Cordialement,<br>L'équipe RED PRODUCT</p>
            `
        };

        // Envoyer l'email avec gestion d'erreur détaillée
        try {
            await transporter.sendMail(mailOptions);
            console.log('Email envoyé avec succès à:', email);
        } catch (emailError) {
            console.error('Erreur détaillée lors de l\'envoi:', emailError);
            throw emailError;
        }

        res.status(200).json({
            message: 'Les instructions ont été envoyées à votre adresse email'
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de l\'envoi de l\'email'
        });
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'Le token et le nouveau mot de passe sont requis'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findOne({
                _id: decoded.userId,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    error: 'Le lien de réinitialisation est invalide ou a expiré'
                });
            }

            // Ne pas hasher le mot de passe ici - laisser le middleware s'en charger
            user.password = newPassword;  // Le middleware pre('save') va automatiquement le hasher

            // Réinitialiser les champs de réinitialisation
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.status(200).json({
                message: 'Votre mot de passe a été réinitialisé avec succès'
            });

        } catch (jwtError) {
            console.error('Erreur JWT:', jwtError);
            return res.status(400).json({
                error: 'Le token de réinitialisation est invalide'
            });
        }

    } catch (error) {
        console.error('Erreur générale:', error);
        res.status(500).json({
            error: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
        });
    }
};


module.exports = { register, login, getCurrentUser, forgotPassword, resetPassword, refresh };
