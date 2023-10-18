const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionBankText: {
        type: String,
    },
    questionText: {
        type: String,
    },
    correctOption: Number
});

const UserAnswerSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    questionText: {
        type: String,
    },
    state: {
        type: String,
    }
});

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
        type: String
    }],
    expirationDate: {
        type: Date
    },
    topic: {
        type: String
    },
    questions: [QuestionSchema],
    userAnswers: [UserAnswerSchema],
    OpenOrClose: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;