const Room = require("../models/room");
const path = require('path');
const {
    generateRoomCode
} = require("../utils/helpers");
const socket = require('../socket');

const create = async (req, res) => {
    try {
        if (req.session.user) {
            let roomCode;

            const teacherName = req.session.user.name;
            const existingRoom = await Room.findOne({
                RoomCode: roomCode
            });
            // 生成唯一的房間代碼
            do {
                roomCode = generateRoomCode();
            } while (existingRoom);

            // 創建新的房間
            const newRoom = new Room({
                MasterName: teacherName,
                RoomName: req.body.roomname,
                RoomCode: roomCode,
            });
            newRoom.Menber.push(teacherName);
            await newRoom.save();
            // console.log(newRoom);

            return res.redirect(`/home/rooms/Room_${roomCode}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}

const classroom = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const userData = req.session.user;
        const gamePath = path.join(__dirname, '..', 'public', 'game.html');
        const room = await Room.findOne({
            RoomCode: roomCode
        });

        if (userData && room) {
            socket.setUserName(userData.name);
            socket.setUserLv(userData.Lv);
            socket.SetRoomCode(room.RoomCode);
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
            const studentName = req.session.user.name;

            if (!room.Menber.includes(studentName)) {
                room.Menber.push(studentName);
                const io = req.app.set('socketio')
                io.emit('NewMemberAdded', room.Menber);
                //console.log(room.Menber)
                await room.save();

                return res.redirect(`./Room_${roomCode}`);
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

        if (room) {
            const UserData = req.session.user;
          //  console.log(UserData);
            return res.redirect(`/home/rooms/Room_${roomCode}`);
        } else {
            console.log('找不到房間');
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    create,
    classroom,
    joinClassroom,
    GoChat
};