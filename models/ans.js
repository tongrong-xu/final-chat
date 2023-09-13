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
    topic: {
        type: String,
        required: true
    },
    ansone: {
        type: String,
        required: true
    },
    anstwo: {
        type: String,
        required: true
    },
    ansthr: {
        type: String,
        required: true
    },
    ansfou: {
        type: String,
        required: true
    },
    ans: {
        type: String,
        required: true
    }
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
});

module.exports = mongoose.model('topic', topicSchema);