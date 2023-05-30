const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    user_phone: {
        type: Number,
        required: true,
        unique: true
    },
    user_password: {
        type: String,
        // required: true
    },
    card_number: {
        type: Number,
        // required: true,
        // unique: true
    },
    card_expiry_month: {
        type: Number,
        // required: true
    },
    card_expiry_year: {
        type: Number,
        // required: true,
    },
    card_holder_name: {
        type: String,
        // required: true,
    },
    user_isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);