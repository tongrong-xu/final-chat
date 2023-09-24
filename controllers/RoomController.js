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
                publicRoom.Menber.push(req.session.user._id);
                await publicRoom.save();
                //console.log("newRoom", newRoom)
                if (publicRoom) {
                    var io = req.app.get('socketio');
                    io.emit('newpublic', publicRoom);
                    //console.log('publicRoom', publicRoom)
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
                teamRoom.Menber.push(req.session.user._id);
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
            return res.sendFile(gamePath);
        }
        return res.redirect(`/home`);
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const classroomData = async (req, res) => {
    try {
        if (req.session.user) {
            const role = req.session.user.role;
            const Lv = req.session.user.Lv;
            const Name = req.session.user.name;

            const responseData = {
                role: role,
                Lv: Lv,
                Name: Name
            };

            res.json(responseData);
        }
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
            //console.log("room", room)
            const studentID = req.session.user._id;
            if (!room.Menber.includes(studentID)) {
                room.Menber.push(studentID);
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
        const studentID = req.session.user._id;
        if (!room.Menber.includes(studentID)) {
            room.Menber.push(studentID);
            await room.save();
        }
        return res.json({
            roomCode: roomCode
        })
    } catch (error) {
        console.log(error.message);
    }
}

const topic = async (req, res) => {
    try {
        const topicPath = path.join(__dirname, '..', 'public', 'qustion.html');
        return res.sendFile(topicPath);
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const QSbankData = async (req, res) => {
    try {
        const qsname = await Questionbank.find({
            MasterName: req.session.user._id
        });
        res.json({
            qsname
        });
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const QuestionBankName = async (req, res) => {
    try {
        const UserRole = req.session.user.role;
        const inputData = req.body.data;
        console.log('Received data:', inputData);
        if (UserRole === 'teacher') {
            const qsname = await Questionbank.findOne({
                $and: [{
                    Itemname: inputData
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (!qsname) {
                const Question = new Questionbank({
                    MasterName: req.session.user._id,
                    role: UserRole,
                    Itemname: inputData,
                });
                await Question.save();
                res.json({
                    Question
                })
            } else {
                console.log(error.message);
            }
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home/rooms/topic`);
    }
}

const BankNameUpdata = async (req, res) => {
    try {
        const originData = req.body.origin;
        const inputData = req.body.data;
        console.log('originData :', originData, 'updata:', inputData);
        const updatedDocument = await Questionbank.findOneAndUpdate({
            $and: [{
                    Itemname: originData
                },
                {
                    MasterName: req.session.user._id
                }
            ]
        }, {
            $set: {
                Itemname: inputData
            }
        }, {
            new: true
        });
        if (updatedDocument) {
            res.json({
                inputData
            });
        } else {
            console.log('未找到');
            res.json({
                message: '未找到'
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}
const Questiontopic = async (req, res) => {
    try {
        const item = req.body.data;
        const Itemname = await Questionbank.findOne({
            Itemname: item
        });
        if (Itemname) {
            const topicview = await topicans.find({
                $and: [{
                    topic: Itemname.topic
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (topicview) {
                //console.log("topicview", topicview)
                res.json({
                    topicview
                });
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}


const QuestionBanktopic = async (req, res) => {
    try {
        const questiontextarea = req.body.questiontextarea;
        const extradata = req.body.extradata
        const qusopation = req.body.qusopation
        const opationname1 = req.body.opationname1
        const opationname2 = req.body.opationname2
        const opationname3 = req.body.opationname3
        const opationname4 = req.body.opationname4

        const Itemname = await Questionbank.findOne({
            $and: [{
                Itemname: extradata
            }, {
                MasterName: req.session.user._id
            }]
        });

        if (Itemname) {
            Itemname.topic.push(questiontextarea)
            await Itemname.save();

            const TopicC = new topicans({
                MasterName: req.session.user._id,
                role: req.session.user.role,
                Itemname: extradata,
                topic: questiontextarea,
                ans: [opationname1, opationname2, opationname3, opationname4],
                correctOption: qusopation
            });

            await TopicC.save();
            
            if (TopicC) {
                console.log('TopicC',TopicC)
                res.json({
                    TopicC
                })
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}


module.exports = {
    create,
    classroom,
    classroomData,
    joinClassroom,
    GoChat,
    topic,
    QSbankData,
    QuestionBankName,
    BankNameUpdata,
    Questiontopic,
    QuestionBanktopic
};