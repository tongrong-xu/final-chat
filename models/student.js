const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
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
    image: {
        type: String,
        required: true
    },
    passwordHash: {
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
    },
    tokens: [{
        token: {
          type: String,
          required: true
        }
      }],
}, {
    timestamps: true
});

UserSchema.methods.generateAuthToken = async function () {
    // this 指向當前的使用者實例
    const user = this
    // 產生一組 JWT
    const token = jwt.sign({
        _id: user._id.toString()
    }, 'thisismyproject')
    // 將該 token 存入資料庫中：讓使用者能跨裝置登入及登出
    user.tokens = user.tokens.concat({
        token
    })
    await user.save()
    // 回傳 JWT
    return token
}

module.exports = mongoose.model('student', UserSchema);