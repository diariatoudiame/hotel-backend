const Hotel = require('../models/Hotel.js')
const fs = require('fs').promises;
const path = require('path');

const getHotels = ((req, res) => {
    Hotel.find({})
        .then(result => res.status(200).json({ result }))
        .catch(error => res.status(500).json({msg: error}))
})

const getHotel = ((req, res) => {
    Hotel.findOne({ _id: req.params.hotelID })
        .then(result => res.status(200).json({ result }))
        .catch(() => res.status(404).json({msg: 'Hotel not found'}))
})



// const createHotel = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'La photo est requise'
//             });
//         }
//
//         const hotelData = {
//             ...req.body,
//             photo: {
//                 filename: req.file.filename,
//                 path: req.file.path,
//                 contentType: req.file.mimetype
//             }
//         };
//
//         const hotel = await Hotel.create(hotelData);
//         res.status(201).json({
//             success: true,
//             data: hotel
//         });
//     } catch (error) {
//         // Supprimer la photo uploadée en cas d'erreur
//         if (req.file) {
//             await fs.unlink(req.file.path);
//         }
//         res.status(500).json({
//             success: false,
//             message: 'Erreur lors de la création de l\'hôtel',
//             error: error.message
//         });
//     }
// };
// hotels.js - Modifiez la fonction createHotel
const createHotel = async (req, res) => {
    try {
        console.log('===== DEBUG =====');
        console.log('1. User authentifié:', req.user); // Vérifie l'authentification
        console.log('2. Body complet:', req.body);
        console.log('3. Fichier:', req.file);

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
            }
        };

        console.log('4. Data avant création:', hotelData);

        const hotel = await Hotel.create(hotelData);
        console.log('5. Hôtel créé:', hotel);

        res.status(201).json({
            success: true,
            data: hotel
        });
    } catch (error) {
        console.log('6. Erreur complète:', error);
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


const updateHotel = ((req, res) => {
    Hotel.findOneAndUpdate({ _id: req.params.hotelID }, req.body, { new: true, runValidators: true })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Hotel not found' }))
})

const deleteHotel = ((req, res) => {
    Hotel.findOneAndDelete({ _id: req.params.hotelID })
        .then(result => res.status(200).json({ result }))
        .catch((error) => res.status(404).json({msg: 'Hotel not found' }))
})

module.exports = {
    getHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel
}

