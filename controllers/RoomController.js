//roomcontroller.js
const Room = require("../models/room");
const path = require('path');
const {
    generateRoomCode
} = require("../utils/helpers");
const sockets = require('../socket');

const create = async (req, res) => {
    try {
        if (req.session.user) {
            let roomCode;
            const roomType = req.body['room-type'];
            const teacherName = req.session.user.name;
            const existingRoom = await Room.findOne({
                RoomCode: roomCode
            });
            const expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + 5);
            // 生成唯一的房間代碼
            do {
                roomCode = generateRoomCode();
            } while (existingRoom);

            // 創建新的房間
            if (roomType === 'public') {
                const publicRoom = new Room({
                    MasterName: teacherName,
                    RoomName: req.body.roomname,
                    RoomCode: roomCode,
                    state: roomType,
                    expirationDate: expirationDate
                });
                publicRoom.Menber.push(teacherName);
                await publicRoom.save();
                //console.log("newRoom", newRoom)
                if (publicRoom) {
                    var io = req.app.get('socketio');
                    io.emit('newpublic', publicRoom);
                    console.log('publicRoom', publicRoom)
                }
                return res.redirect(`/home/rooms/Room_${roomCode}`);
            } else if (roomType === 'team') {
                const teamRoom = new Room({
                    MasterName: req.session.user.name,
                    RoomName: req.body.roomname,
                    RoomCode: roomCode,
                    state: roomType,
                    expirationDate: expirationDate
                });
                teamRoom.Menber.push(req.session.user.name);
                await teamRoom.save();
                //console.log("newRoom", teamRoom)
                return res.redirect(`/home/rooms/Room_${roomCode}`);
            } else {
                return res.redirect(`/home`);
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const classroom = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const userData = req.session.user.name;
        const gamePath = path.join(__dirname, '..', 'public', 'game.html');
        const room = await Room.findOne({
            RoomCode: roomCode
        });

        if (userData && room) {
            sockets.SetRoomCode(room.RoomCode);
            sockets.setUserName(req.session.user.name);
            sockets.setUserLv(req.session.user.Lv);
            var io = req.app.get('socketio');
            io.to(roomCode).emit('myuser', userData);
            //console.log('classroomend', userData)
            return res.sendFile(gamePath);
        }
        return res.redirect(`/home`);
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const joinClassroom = async (req, res) => {
    try {
        const {
            roomCode
        } = req.body;
        const room = await Room.findOne({
            RoomCode: roomCode
        });

        if (room) {
            console.log("room", room)
            const studentName = req.session.user.name;
            if (!room.Menber.includes(studentName)) {
                room.Menber.push(studentName);
                await room.save();
                return res.redirect(`/home/rooms/Room_${roomCode}`);
            } else {
                console.log('已在房間');
                return res.redirect('/home?message=alreadyjoined');
            }
        } else {
            console.log('找不到房間');
            return res.redirect('/home?message=unknow');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const GoChat = async (req, res) => {
    try {
        const {
            roomCode
        } = req.body;
        const room = await Room.findOne({
            RoomCode: roomCode
        });
        const studentName = req.session.user.name;
        console.log('me', studentName)
        if (!room.Menber.includes(studentName)) {
            room.Menber.push(studentName);
            await room.save();
        }
        return res.redirect(`/home/rooms/Room_${roomCode}`);
    } catch (error) {
        console.log(error.message);
    }
}

const topic = (req, res) => {
    try {
        const userData = req.session.user;
        const topicPath = path.join(__dirname, '..', 'public', 'qustion-bank.html');
        console.log(userData)    
        res.sendFile(topicPath);
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

module.exports = {
    create,
    classroom,
    joinClassroom,
    GoChat,
    topic
};