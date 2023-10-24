const mongoose = require('mongoose');
// 定義使用者的資料庫模型（User Model）
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
    passwordHash: {
        type: String,
        required: true
    },
    image: {
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
    }, token: {
        type: String,
        default: null
    },
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
});


UserSchema.methods.delAuthToken = async function () {
    const user = this
    user.token = null
    await user.save()
}

UserSchema.methods.generateAuthToken = async function (token) {
    const user = this
    user.token = token
    await user.save()
}


// 將 UserSchema 轉為 User Model
module.exports = mongoose.model('teacher', UserSchema);