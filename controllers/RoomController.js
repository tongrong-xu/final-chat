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
            const roomType = req.body["room-type"];
            const roomPermissions = req.body["room-permissions"];
            const OpenOrClose = "Open"
            const existingRoom = await Room.findOne({
                RoomCode: roomCode
            });
            const expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + req.body.days * 24 * 60);
            // 生成唯一的房間代碼
            do {
                roomCode = generateRoomCode();
            } while (existingRoom);

            // 創建新的房間
            if (roomPermissions === 'public') {
                const publicRoom = new Room({
                    MasterName: req.session.user.name,
                    RoomName: req.body.roomname,
                    RoomCode: roomCode,
                    type: roomType,
                    state: roomPermissions,
                    expirationDate: expirationDate,
                    OpenOrClose: OpenOrClose
                });
                publicRoom.Member.push(req.session.user._id);
                await publicRoom.save();
                if (publicRoom) {
                    var io = req.app.get('socketio');
                    io.emit('newpublic', publicRoom);

                }
                return res.redirect(`/home/rooms/Room_${roomCode}`);
            } else if (roomPermissions === 'private') {
                const teamRoom = new Room({
                    MasterName: req.session.user.name,
                    RoomName: req.body.roomname,
                    RoomCode: roomCode,
                    type: roomType,
                    state: roomPermissions,
                    expirationDate: expirationDate
                });
                teamRoom.Member.push(req.session.user._id);
                await teamRoom.save();
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
                Name: Name,
                id: req.session.user._id
            };

            res.json(responseData);
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const roomTime = async (req, res) => {
    try {
        const code = req.body.data;
        const room = await Room.findOne({
            RoomCode: code
        });
        if (room) {
            const time = room.expirationDate
            res.json({
                time
            });
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
            const studentID = req.session.user._id;
            if (!room.Member.includes(studentID)) {
                room.Member.push(studentID);
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
        if (!room.Member.includes(studentID)) {
            room.Member.push(studentID);
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
        if (qsname) {
            res.json({
                qsname,
                role: req.session.user.role
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const userAnswers = async (req, res) => {
    try {
        const RoomCode = req.body.RoomCode
        const room = await Room.findOne({
            RoomCode: RoomCode
        });
        const userId = req.session.user._id
        if (room) {
            const userAnswersResults = room.userAnswers.filter(answer => answer.userId === userId);
            if (userAnswersResults) {
                res.json({
                    userAnswersResults
                });
            }
        } else {
            console.log("未找到符合的房間。");
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const QuestionBankName = async (req, res) => {
    try {
        const UserRole = req.session.user.role;
        const inputData = req.body.data;
        if (UserRole === 'teacher') {
            const qsname = await Questionbank.findOne({
                $and: [{
                    Itemname: inputData
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (qsname) {
                console.log('已有名稱');
                return res.status(400).json({
                    error: '題庫名稱已存在'
                });
            } else if (!qsname) {
                const Question = new Questionbank({
                    MasterName: req.session.user._id,
                    role: UserRole,
                    Itemname: inputData,
                });
                await Question.save();
                if (Question) {
                    const qsname = await Questionbank.find({
                        MasterName: req.session.user._id
                    });
                    if (qsname) {
                        res.json({
                            qsname
                        });
                    }
                }
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
        const originData = req.body.origindata;
        const inputData = req.body.newdata;
        const qsname = await Questionbank.findOne({
            $and: [{
                Itemname: inputData
            }, {
                MasterName: req.session.user._id
            }]
        });
        if (qsname) {
            console.log('已有名稱');
            return res.status(400).json({
                error: '題庫名稱已存在'
            });
        } else if (!qsname) {
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
                const updatetopic = await topicans.updateMany({
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
                if (updatetopic) {
                    const qsname = await Questionbank.find({
                        MasterName: req.session.user._id
                    });
                    if (qsname) {
                        res.json({
                            qsname
                        });
                    }
                }
            } else {
                console.log('未找到');
                res.json({
                    message: '未找到'
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

const QSbankDel = async (req, res) => {
    try {
        const Del = req.body.data
        const Removeqsname = await Questionbank.findOneAndRemove({
            $and: [{
                Itemname: Del
            }, {
                MasterName: req.session.user._id
            }]
        });
        if (Removeqsname) {
            const deletetopic = await topicans.deleteMany({
                $and: [{
                    Itemname: Del
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (deletetopic) {
                const Newqsname = await Questionbank.find({
                    MasterName: req.session.user._id
                });

                if (Newqsname) {
                    res.json({
                        Newqsname
                    });
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const Questiontopic = async (req, res) => {
    try {
        const item = req.body.data;
        const Itemname = await Questionbank.findOne({
            $and: [{
                Itemname: item
            }, {
                MasterName: req.session.user._id
            }]
        });
        if (Itemname) {
            const topicview = await topicans.find({
                $and: [{
                    Itemname: item
                }, {
                    topic: Itemname.topic
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (topicview) {
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
                const topicview = await topicans.find({
                    $and: [{
                        Itemname: extradata
                    }, {
                        topic: Itemname.topic
                    }, {
                        MasterName: req.session.user._id
                    }]
                });
                res.json({
                    topicview
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

const QuestionBanktopicUpdata = async (req, res) => {
    try {
        const questiontextarea = req.body.questiontextarea;
        const origintextarea = req.body.origintextarea;
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
            const index = Itemname.topic.indexOf(origintextarea);
            if (index !== -1) {
                Itemname.topic[index] = questiontextarea;
                await Itemname.save();
                if (Itemname) {
                    const updatedDocument = await topicans.findOneAndUpdate({
                        $and: [{
                                Itemname: extradata
                            },
                            {
                                topic: origintextarea
                            },
                            {
                                MasterName: req.session.user._id
                            }
                        ]
                    }, {
                        $set: {
                            Itemname: extradata,
                            topic: questiontextarea,
                            ans: [opationname1, opationname2, opationname3, opationname4],
                            correctOption: qusopation
                        }
                    }, {
                        new: true
                    });
                    if (updatedDocument) {
                        const topicview = await topicans.find({
                            $and: [{
                                Itemname: extradata
                            }, {
                                topic: Itemname.topic
                            }, {
                                MasterName: req.session.user._id
                            }]
                        });
                        if (topicview) {
                            res.json({
                                topicview
                            })
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}
const QSbanktopicDel = async (req, res) => {
    try {
        const bankname = req.body.bankname
        const DeleteQuetionName = req.body.DeleteQuetionName
        const Removeqsname = await topicans.findOneAndRemove({
            $and: [{
                Itemname: bankname
            }, {
                topic: DeleteQuetionName
            }, {
                MasterName: req.session.user._id
            }]
        });
        if (Removeqsname) {
            const Itemname = await Questionbank.findOne({
                $and: [{
                    Itemname: bankname
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (Itemname) {
                const index = Itemname.topic.indexOf(DeleteQuetionName);
                if (index !== -1) {
                    Itemname.topic.splice(index, 1);
                    await Itemname.save();

                    const topicview = await topicans.find({
                        $and: [{
                            Itemname: bankname
                        }, {
                            topic: Itemname.topic
                        }, {
                            MasterName: req.session.user._id
                        }]
                    });
                    if (topicview) {
                        res.json({
                            topicview
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.redirect(`/home`);
    }
}

const QusToGame = async (req, res) => {
    try {
        const selectedQuestions = req.body.selectedQuestions;
        const selectedQusBankParts = req.body.selectedQusBankParts;
        // console.log(selectedQuestions, selectedQusBankParts)
        const Itemname = await Questionbank.findOne({
            $and: [{
                Itemname: selectedQusBankParts
            }, {
                MasterName: req.session.user._id
            }]
        });
        if (Itemname) {
            const topicview = await topicans.find({
                $and: [{
                    Itemname: selectedQusBankParts
                }, {
                    topic: selectedQuestions
                }, {
                    MasterName: req.session.user._id
                }]
            });
            if (topicview) {
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


module.exports = {
    create,
    classroom,
    classroomData,
    joinClassroom,
    GoChat,
    topic,
    QSbankData,
    userAnswers,
    QSbankDel,
    QuestionBankName,
    BankNameUpdata,
    Questiontopic,
    QuestionBanktopic,
    QuestionBanktopicUpdata,
    QSbanktopicDel,
    roomTime,
    QusToGame
};