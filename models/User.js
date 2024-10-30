const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    photo: {
        type: String,
        default: null
    }
    // photo: {
    //     filename: {
    //         type: String,
    //         required: true
    //     },
    //     path: {
    //         type: String,
    //         required: true
    //     },
    //     contentType: {
    //         type: String,
    //         required: true
    //     }
    // }
});

// Méthode pour hasher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
