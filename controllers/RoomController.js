//roomcontroller.js
const Room = require("../models/room");
const Questionbank = require("../models/Questionbank");
const topicans = require("../models/topic");
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
        if (!room.Menber.includes(studentName)) {
            room.Menber.push(studentName);
            await room.save();
        }
        return res.redirect(`/home/rooms/Room_${roomCode}`);
    } catch (error) {
        console.log(error.message);
    }
}

const topic = async (req, res) => {
    try {
        const userData = req.session.user;
        const topicPath = path.join(__dirname, '..', 'public', 'qustion.html');
        const qsname = await Questionbank.find({
            MasterName: userData.name
        });
        sockets.Qsname(qsname)
        //console.log('userData', userData)
        //console.log('qsname', qsname)
        return res.sendFile(topicPath);
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const QuestionBankName = async (req, res) => {
    try {
        const UserRole = req.session.user.role;
        if (UserRole === 'teacher') {
            const Questionname = req.body.QuestionBank;
            const qsname = await Questionbank.findOne({
                Itemname: Questionname
            });
            if (!qsname) {
                const Question = new Questionbank({
                    MasterName: req.session.user.name,
                    role: UserRole,
                    Itemname: Questionname,
                });
                await Question.save();
            }
            return res.redirect(`/home/rooms/topic`);
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home/rooms/topic`);
    }
}

const Questiontopic = async (req, res) => {
    try {
        const item = req.body.Itemname;
        const Itemname = await Questionbank.findOne({
            Itemname: item
        });

        const topicview = await topicans.find({
            topic: Itemname.topic
        });

        if (topicview) {
            console.log("Itemname0:topic", Itemname.topic)
            console.log("topicview", topicview)
            res.json({
                topicview
            });
        }
        //return res.redirect(`/home/rooms/topic`);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

const QuestionBanktopic = async (req, res) => {
    try {
        //const item = req.body;
        console.log(req.body.extradata)
        console.log(req.session.user.name)
        const Itemname = await Questionbank.findOne({
            $and: [{
                Itemname: req.body.extradata
            }, {
                MasterName: req.session.user.name
            }]
        });
        if (Itemname) {
            Itemname.topic.push(req.body.questiontextarea)
            await Itemname.save();

            console.log(req.body)

            const TopicC = new topicans({
                MasterName: req.session.user.name,
                role: req.session.user.role,
                Itemname: req.body.extradata,
                topic: req.body.questiontextarea,
                ans: [req.body.opationname1, req.body.opationname2, req.body.opationname3, req.body.opationname4],
                correctOption: req.body.qusopation
            });

            await TopicC.save();
            return res.redirect(`/home/rooms/topic`);

        }
        console.log(Itemname)
        //return res.redirect(`/home/rooms/topic`);
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    create,
    classroom,
    joinClassroom,
    GoChat,
    topic,
    QuestionBankName,
    Questiontopic,
    QuestionBanktopic
};