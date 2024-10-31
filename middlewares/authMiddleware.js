// const jwt = require('jsonwebtoken');
//
// const authMiddleware = (req, res, next) => {
//     // Récupérer le header Authorization
//     const authHeader = req.header('Authorization');
//
//     // Vérifier si le header existe avant d'essayer de le manipuler
//     if (!authHeader) {
//         return res.status(401).json({ msg: 'No token, authorization denied' });
//     }
//
//     // Extraire le token
//     const token = authHeader.replace('Bearer ', '');
//
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded.userId;
//         next();
//     } catch (error) {
//         res.status(401).json({ msg: 'Token is not valid' });
//     }
// };
//
// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ajoutez cette ligne - ajustez le chemin selon votre structure

const authMiddleware = async (req, res, next) => {
    try {
        // Récupérer le header Authorization
        const authHeader = req.header('Authorization');

        // Vérifier si le header existe
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Pas de token, autorisation refusée'
            });
        }

        // Extraire le token
        const token = authHeader.replace('Bearer ', '');

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupérer l'utilisateur complet depuis la base de données
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Attacher l'utilisateur complet à la requête
        req.user = user;
        next();

    } catch (error) {
        console.log('Erreur d\'authentification:', error);
        res.status(401).json({
            success: false,
            message: 'Token invalide',
            error: error.message
        });
    }
};

module.exports = authMiddleware;