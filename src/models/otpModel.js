const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: [{
        type: String,
        required: true
    }],
    createdAt: {
        type: Date,
        expires: '10m',
        default: Date.now
    },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema)