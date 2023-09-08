const student = require("../models/student");
const teacher = require("../models/teacher");
const Room = require("../models/room");
const bcrypt = require("bcrypt");
const path = require('path');
const socket = require('../socket');

// 學生登入處理函式
const loginstudent = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await student.findOne({
            email: email
        });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
            if (passwordMatch) {
                req.session.user = userData;
                if (userData.role === 'student') {
                    console.log("學生登入");
                    return res.redirect('/home');
                }
            }
        }
        res.redirect('/?message=Email%20NG');
        console.error('找不到學生使用者或密碼不匹配');
        return res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

// 學生註冊處理函式
const registerstudent = async (req, res) => {
    try {
        const email = req.body.email;
        const role = "student"
        const existingteacher = await teacher.findOne({
            email: email
        });
        const existingstudent = await student.findOne({
            email: email
        });

        if (existingteacher || existingstudent) {
            console.log("重複註冊");
            return res.redirect('/?message=Email%20already');
        } else {
            const passwordHash = await bcrypt.hash(req.body.password, 10);

            const user = new student({
                name: req.body.username,
                email: email,
                passwordHash: passwordHash,
                password: req.body.password,
                role: role
            });

            await user.save();

            res.redirect('/?message=Email%20pass');

            console.log(user, "學生通過註冊");
        }
    } catch (error) {
        console.log(error.message);
    }
}

// 教師登入處理函式
const loginteacher = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await teacher.findOne({
            email: email
        });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.passwordHash);
            if (passwordMatch) {
                req.session.user = userData;
                if (userData.role === 'teacher') {
                    console.log("教師登入");
                    return res.redirect('/home');
                }
            }
        }
        res.redirect('/?message=Email%20NG');
        console.error('找不到教師使用者或密碼不匹配');
        return res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

// 教師註冊處理函式
const registerteacher = async (req, res) => {
    try {
        const email = req.body.email;
        const role = "teacher"
        const existingteacher = await teacher.findOne({
            email: email
        });
        const existingstudent = await student.findOne({
            email: email
        });

        if (existingteacher || existingstudent) {
            console.log("重複註冊");
            return res.redirect('/?message=Email%20already');
        } else {
            const passwordHash = await bcrypt.hash(req.body.password, 10);

            const user = new teacher({
                name: req.body.username,
                email: email,
                passwordHash: passwordHash,
                password: req.body.password,
                role: role
            });

            await user.save();

            res.redirect('/?message=Email%20pass');

            console.log(user, "教師通過註冊");
        }
    } catch (error) {
        console.log(error.message);
    }
}

// 首頁處理函式
const home = async (req, res) => {
    try {

        const HtmlPath = path.join(__dirname, '..', 'public', 'personal.html');
        if (req.session.user) {
            //console.log(req.session.user)
            const role = req.session.user.role;
            const Lv = req.session.user.Lv;
            const Name = req.session.user.name;
            if (role === 'student') {
                const roomQuery = {
                    $or: [{
                        Menber: Name
                    }, {
                        MasterName: Name
                    }]
                };
                const rooms = await Room.find(roomQuery);
                const roomInfo = rooms.map(room => {
                    return {
                        RoomCode: room.RoomCode,
                        RoomName: room.RoomName,
                        teacehr: room.MasterName,
                        LastUpdatedAt: room.updatedAt
                    };
                });
                socket.setUserName(Name);
                socket.setUserrole(role);
                socket.setUserLv(Lv);
                socket.ViewRoomCode(roomInfo);
                const io = req.app.get('socketio'); // 獲取 Socket.io 實例
                io.emit('updateRooms', roomInfo);
            } else if (role === 'teacher') {
                const roomQuery = {
                    $or: [{
                        Menber: Name
                    }, {
                        MasterName: Name
                    }]
                };
                const rooms = await Room.find(roomQuery);
                const roomInfo = rooms.map(room => {
                    return {
                        RoomCode: room.RoomCode,
                        RoomName: room.RoomName,
                        teacehr: room.MasterName,
                        LastUpdatedAt: room.updatedAt
                    };
                });
                socket.setUserName(Name);
                socket.setUserrole(role);
                socket.setUserLv(Lv);
                socket.ViewRoomCode(roomInfo);
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
        res.sendFile(HtmlPath);
    } catch (error) {
        console.log(error.message);
    }
}

// 登入頁面載入處理函式
const loadlogin = async (req, res) => {
    try {
        res.redirect('index.html'); // 渲染登入頁面
    } catch (error) {
        console.log(error.message);
    }
}

// 登出處理函式
const logout = async (req, res) => {
    try {
        req.session.destroy(); // 清除session
        res.redirect('/'); // 重定向到首頁
        console.log("登出");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loginstudent,
    registerstudent,
    loginteacher,
    registerteacher,
    loadlogin,
    logout,
    home
};