const mongoose = require('mongoose');
// 定義使用者的資料庫模型（User Model）
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // 必填屬性，使用者名稱
    },
    id: {
        type: String,
    },
    email: {
        type: String,
        required: true // 必填屬性，使用者電子郵件
    },
    passwordHash: {
        type: String,
        required: true // 必填屬性，使用者密碼
    },
    password: {
        type: String,
        required: true // 必填屬性，使用者密碼
    },
    role: {
        type: String,
        required: true // 必填屬性，職業
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
    online: {
        type: Boolean,
        default: false 
    },
}, {
    timestamps: true // 自動添加 createdAt 和 updatedAt 欄位
});

// 將 UserSchema 轉為 User Model
module.exports = mongoose.model('teacher', UserSchema);