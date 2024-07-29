const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    RoomCode: {
        type: String,
        required: true
    },
    group: String,
    username: String,
    time: String,
    content: String
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);