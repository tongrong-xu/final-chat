// models/chatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    RoomCode: {
        type: String,
        required: true
    },
    username: String, // 發送者的使用者名稱
    time: String, // 訊息的時間戳記
    content: String // 訊息內容
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);