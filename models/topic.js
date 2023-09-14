const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    MasterName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    Itemname: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    ans: [
        String
    ],
    correctOption: Number
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
});

module.exports = mongoose.model('topic', topicSchema);