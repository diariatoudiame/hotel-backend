// const multer = require('multer');
// const path = require('path');
//
// // Configuration du stockage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/hotels'); // Les photos seront stockées dans ce dossier
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, 'hotel-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });
//
// // Filtre pour n'accepter que les images
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Le fichier doit être une image!'), false);
//     }
// };
//
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024 // Limite à 5MB
//     }
// });
//
// module.exports = upload;



const multer = require('multer');
const path = require('path');

// Configuration de base pour les limites et les filtres
const baseConfig = {
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Le fichier doit être une image!'), false);
        }
    }
};

// Configuration spécifique pour les hôtels
const hotelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/hotels');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `hotel-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Configuration spécifique pour les profils utilisateurs
const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/users');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `user-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Créer les instances multer pour chaque type d'upload
const uploadHotel = multer({
    ...baseConfig,
    storage: hotelStorage
});

const uploadProfile = multer({
    ...baseConfig,
    storage: userStorage
});

// Middleware pour gérer plusieurs images d'hôtel
const handleHotelPhotos = uploadHotel.single('photo'); // Maximum 10 photos

// Middleware pour gérer une seule photo de profil
const handleProfilePhoto = uploadProfile.single('photo');

// Wrapper function pour gérer les erreurs multer
const wrapMulterMiddleware = (middleware) => {
    return (req, res, next) => {
        middleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Gérer les erreurs spécifiques à Multer
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'La taille du fichier dépasse la limite autorisée (5MB)'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        error: 'Trop de fichiers ont été uploadés'
                    });
                }
                return res.status(400).json({ error: err.message });
            } else if (err) {
                // Gérer les autres erreurs
                return res.status(400).json({ error: err.message });
            }
            next();
        });
    };
};

module.exports = {
    uploadHotelPhotos: wrapMulterMiddleware(handleHotelPhotos),
    uploadProfilePhoto: wrapMulterMiddleware(handleProfilePhoto)
};