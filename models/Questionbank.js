const mongoose = require('mongoose');

const QuestionbankSchema = new mongoose.Schema({
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
    topic: [{
        type: String
    }],
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
});

module.exports = mongoose.model('Questionbank', QuestionbankSchema);