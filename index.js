// const express = require('express')
// const mongoose = require('mongoose')
// const cors = require('cors') // Ajoutez cette ligne
// const app = express()
// const Hotel = require('./models/Hotel.js')
// const routes = require('./routes/routes')
// // const authRoutes = require('./routes/hotels')
//
// require('dotenv').config()
//
// // Ajoutez la configuration CORS avant les autres middlewares
// app.use(cors({
//     origin: ['https://hotel-frontend-2e3m.vercel.app/', 'http://localhost:3000'],// L'URL de votre frontend Next.js
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
// }))
//
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     if (req.method === 'OPTIONS') {
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//         return res.status(200).json({});
//     }
//     next();
// });
//
// app.use(express.json())
// app.use('/api', routes)
// // Middleware pour servir les fichiers statiques dans le dossier 'uploads'
// app.use('/uploads', express.static('uploads'));
//
//
// // app.use('/api/auth', authRoutes);
//
// mongoose.connect(process.env.MONGO_URI)
//     .then((result) => {
//         app.listen(5000, () => {
//             console.log('Server running on port 5000 and connected to MongoDB')
//         })
//     })
//     .catch((err) => console.log(err))

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const Hotel = require('./models/Hotel.js')
const routes = require('./routes/routes')
require('dotenv').config()

// Définir les origines autorisées
const allowedOrigins = [
    'https://hotel-frontend-x8ro.vercel.app',  // Retirez le slash à la fin
    'http://localhost:3000'
];

// Configuration CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permettre les requêtes sans origine (comme les appels API mobiles ou Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400 // Cache CORS preflight pendant 24 heures
};

// Appliquer la configuration CORS
app.use(cors(corsOptions));

// Middleware pour gérer les erreurs CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            message: 'CORS not allowed for this origin'
        });
    } else {
        next(err);
    }
});

// Configuration de base
app.use(express.json());
app.use('/api', routes);
app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => {
            console.log('Server running on port 5000 and connected to MongoDB')
        })
    })
    .catch((err) => console.log(err));