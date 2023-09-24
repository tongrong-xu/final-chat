const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    Lv: {
        type: Number,
        default: 1
    },
    points: {
        type: Number,
        default: 0
    },
    coin: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('student', UserSchema);