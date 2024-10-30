const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    devise: {
        type: String,
        required: true
    },
    photo: {
        filename: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', HotelSchema);
