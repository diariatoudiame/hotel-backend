const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors') // Ajoutez cette ligne
const app = express()
const Hotel = require('./models/Hotel.js')
const routes = require('./routes/routes')
// const authRoutes = require('./routes/hotels')

require('dotenv').config()

// Ajoutez la configuration CORS avant les autres middlewares
app.use(cors({
    origin: ['https://hotel-frontend-2e3m.vercel.app/', 'http://localhost:3000'],// L'URL de votre frontend Next.js
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}))

app.use(express.json())
app.use('/api', routes)
// Middleware pour servir les fichiers statiques dans le dossier 'uploads'
app.use('/uploads', express.static('uploads'));


// app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then((result) => {
        app.listen(5000, () => {
            console.log('Server running on port 5000 and connected to MongoDB')
        })
    })
    .catch((err) => console.log(err))