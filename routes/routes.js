const express = require('express');
const { uploadHotelPhotos, uploadProfilePhoto } = require('../middlewares/uploadMiddleware');
const {
    register,
    login,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    refresh
} = require('../controllers/users');
const {
    getHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotels.js');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Routes utilisateurs
router.post('/register', uploadProfilePhoto, register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refresh);

// Routes hôtels
router.get('/hotels', authMiddleware, getHotels);
router.get('/hotel/:hotelID', authMiddleware, getHotel);
router.post('/hotels', authMiddleware, uploadHotelPhotos, createHotel);
router.put('/hotels/:hotelID', authMiddleware, uploadHotelPhotos, updateHotel);
router.delete('/hotels/:hotelID', authMiddleware, deleteHotel);

module.exports = router;