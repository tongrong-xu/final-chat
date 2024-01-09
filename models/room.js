const mongoose = require('mongoose');

// UserAnswer 和 Question 的 Schema 保持不變
const UserAnswerSchema = new mongoose.Schema({
    userId: String,
    questionText: String,
    state: String
});

const QuestionSchema = new mongoose.Schema({
    questionBankText: String,
    questionText: String,
    correctOption: Number,
    userAnswers: [UserAnswerSchema],
    answerCounts: {
        trueCount: Number,
        falseCount: Number,
        unfinishCount: Number,
    },
    answerPercentages: {
        truePercentage: Number,
        falsePercentage: Number,
        unfinishPercentage: Number,
    },
});

// 定義 GroupMemberSchema 來存儲組員詳細信息
const GroupMemberSchema = new mongoose.Schema({
    _id: String, // MongoDB 默認的 _id 字段
    name: String,
    Lv: Number
});

// 更新後的 GroupSchema 包含 GroupMemberSchema
const GroupSchema = new mongoose.Schema({
    groupName: String,
    members: [GroupMemberSchema]
});

// 更新後的 RoomSchema 包含 GroupSchema
const RoomSchema = new mongoose.Schema({
    MasterName: {
        type: String,
        required: true
    },
    RoomName: {
        type: String,
        required: true
    },
    RoomCode: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    Member: [{
        type: String // 這里假設 Member 仍然是一個由字符串 ID 組成的數組
    }],
    expirationDate: {
        type: Date
    },
    topic: {
        type: String
    },
    questions: [QuestionSchema],
    groups: [GroupSchema],
    isGrouped: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', RoomSchema);