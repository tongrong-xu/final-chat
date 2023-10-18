const express = require('express');
const user = express.Router(); // 建立一個Express應用程式實例，代表使用者相關的路由
const student = require("../models/student");
const teacher = require("../models/teacher");
const path = require('path');
const jwt = require('jsonwebtoken')
// 引入自定義的身份驗證中間件防止網址亂導向
const auth = require('../middlewares/auth');
const bodyParser = require('body-parser');
user.use(bodyParser.json());
//
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})

const upload = multer({
    storage: storage
})
const UserController = require('../controllers/UserController');

const authenticateToken = async (req, res, next) => {
    try {
        // 從來自客戶端請求的 header 取得和擷取 JWT
        const token = req.header('Authorization').replace('Bearer ', '')
        // 驗證 Token
        const decoded = jwt.verify(token, 'thisismynewproject')
        // 找尋符合用戶 id 和 Tokens 中包含此 Token 的使用者資料
        const user = await student.findOne({
            _id: decoded._id,
            'tokens.token': token
        })
        // 若沒找到此用戶，丟出錯誤
        if (!user) {
            throw new Error()
        }
        // 將 token 存到 req.token 上供後續使用
        req.token = token
        // 將用戶完整資料存到 req.user 上供後續使用
        req.user = user
        next()
    } catch (err) {
        res.status(401).send({
            error: 'Please authenticate.'
        })
    }
};

// 首頁
user.get('/', auth.requireLogout, UserController.loadlogin);

// 學生登入
user.post('/loginstudent', UserController.loginstudent);

// 學生註冊
user.post('/registerstudent', auth.requireLogout, upload.single('image'), UserController.registerstudent); // 使用 POST 請求處理註冊

// 教師登入
user.post('/loginteacher', UserController.loginteacher);

// 教師註冊
user.post('/registerteacher', auth.requireLogout, upload.single('image'), UserController.registerteacher); // 使用 POST 請求處理註冊

// 登出
user.get('/logout', auth.requireLogin, UserController.logout);

// 使用者首頁
user.get('/home', auth.requireLogin, UserController.home);


user.get('/homeData', auth.requireLogin, UserController.homeData);


// 導入 RoomRoute 路由
const RoomRoute = require('./RoomRoute');

user.use('/home/rooms', RoomRoute);

// 首頁
user.get('*', function (req, res) {
    res.redirect('/');
});

module.exports = user;