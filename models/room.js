const mongoose = require('mongoose');

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

const QuestionSchema = new mongoose.Schema({
    questionBankText: {
        type: String,
    },
    questionText: {
        type: String,
    },
    correctOption: Number,
    userAnswers: [UserAnswerSchema],
    Truepercent: {
        type: String,
    },
    Falsepercent: {
        type: String,
    },
    Unfinishpercent: {
        type: String,
    },

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
    questions: [QuestionSchema]
}, {
    timestamps: true
});


module.exports = mongoose.model('Room', RoomSchema);