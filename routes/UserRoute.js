const express = require('express');
const user = express.Router(); // 建立一個Express應用程式實例，代表使用者相關的路由

const path = require('path');

// 引入自定義的身份驗證中間件防止網址亂導向
const auth = require('../middlewares/auth');
const bodyParser = require('body-parser');
user.use(bodyParser.json());
//
const UserController = require('../controllers/UserController');

// 首頁
user.get('/', auth.requireLogout, UserController.loadlogin);

// 學生登入
user.post('/loginstudent', UserController.loginstudent);

// 學生註冊
user.post('/registerstudent', auth.requireLogout, UserController.registerstudent); // 使用 POST 請求處理註冊

// 教師登入
user.post('/loginteacher', UserController.loginteacher);

// 教師註冊
user.post('/registerteacher', auth.requireLogout, UserController.registerteacher); // 使用 POST 請求處理註冊

// 登出
user.get('/logout', auth.requireLogin, UserController.logout);

// 使用者首頁
user.get('/home', auth.requireLogin, UserController.home);

// 導入 RoomRoute 路由
const RoomRoute = require('./RoomRoute');
user.use('/home/rooms', RoomRoute);

// 首頁
user.get('*', function (req, res) {
    res.redirect('/home');
});

module.exports = user;
