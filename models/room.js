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
    answerCounts: {
        trueCount: {
            type: Number,
        },
        falseCount: {
            type: Number,
        },
        unfinishCount: {
            type: Number,
        },
    },
    answerPercentages: {
        truePercentage: {
            type: Number,
        },
        falsePercentage: {
            type: Number,
        },
        unfinishPercentage: {
            type: Number,
        },
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