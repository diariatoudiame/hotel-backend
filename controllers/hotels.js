const Hotel = require('../models/Hotel.js')
const fs = require('fs').promises;
const path = require('path');

const getHotels = async (req, res) => {
    try {
        // Utilise req.user qui contient l'ID de l'utilisateur fourni par votre middleware
        const hotels = await Hotel.find({ user: req.user })
            .sort({ createdAt: -1 }); // Optionnel: trie par date de création décroissante

        res.status(200).json({
            success: true,
            count: hotels.length,
            result: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Erreur lors de la récupération des hôtels",
            error: error.message
        });
    }
};

// Pour la création d'un hôtel
const createHotel = async (req, res) => {
    try {
        console.log('===== DEBUG =====');
        console.log('1. User authentifié:', req.user); // Vérifie l'authentification
        console.log('2. Body complet:', req.body);
        console.log('3. Fichier:', req.file);

        // Vérification de l'authentification
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifié'
            });
        }

        // Vérification de la photo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'La photo est requise'
            });
        }

        // Vérification des champs requis
        const requiredFields = ['name', 'address', 'email', 'phone_number', 'price', 'devise'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Champs manquants: ${missingFields.join(', ')}`
            });
        }

        // Construction des données de l'hôtel avec l'utilisateur
        const hotelData = {
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            phone_number: req.body.phone_number,
            price: Number(req.body.price),
            devise: req.body.devise,
            photo: {
                filename: req.file.filename,
                path: `/uploads/hotels/${req.file.filename}`,
                contentType: req.file.mimetype
            },
            user: req.user._id, // Ajout de l'ID de l'utilisateur connecté
            createdBy: req.user._id // Optionnel: pour tracer qui a créé l'hôtel
        };

        console.log('4. Data avant création:', hotelData);

        // Création de l'hôtel avec les données de l'utilisateur
        const hotel = await Hotel.create(hotelData);

        console.log('5. Hôtel créé:', hotel);

        // Optionnel: Populer les données de l'utilisateur dans la réponse
        const populatedHotel = await Hotel.findById(hotel._id).populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: populatedHotel
        });

    } catch (error) {
        console.log('6. Erreur complète:', error);

        // Nettoyage du fichier en cas d'erreur
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
                console.log('7. Fichier supprimé après erreur');
            } catch (unlinkError) {
                console.log('8. Erreur lors de la suppression du fichier:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'hôtel',
            error: error.message
        });
    }
};


// Pour mettre à jour un hôtel
const updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOneAndUpdate(
            { _id: req.params.id, user: req.user }, // Vérifie que l'hôtel appartient à l'utilisateur
            req.body,
            { new: true, runValidators: true }
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hôtel non trouvé ou vous n'avez pas les droits pour le modifier"
            });
        }

        res.status(200).json({
            success: true,
            result: hotel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Erreur lors de la mise à jour de l'hôtel",
            error: error.message
        });
    }
};

// Pour supprimer un hôtel
const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOneAndDelete({
            _id: req.params.id,
            user: req.user
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                msg: "Hôtel non trouvé ou vous n'avez pas les droits pour le supprimer"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Hôtel supprimé avec succès"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Erreur lors de la suppression de l'hôtel",
            error: error.message
        });
    }
};


module.exports = {
    getHotels,
    createHotel,
    updateHotel,
    deleteHotel
};