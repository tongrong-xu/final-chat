const Room = require("./models/room");
const student = require("./models/student");
const teacher = require("./models/teacher");
const MassageHistory = require("./models/chathistory");
const Questionbank = require("./models/Questionbank");
const topic = require("./models/topic");
const {
    v4: uuidv4
} = require('uuid');
// 宣告全域變數

let RoomViewCode;
let qsname;

// 設定觀看房間代碼
function ViewRoomCode(viewcode) {
    RoomViewCode = viewcode;
}

function Qsname(qsb) {
    qsname = qsb;
}


// 主要的 socket 事件處理函式
const Online = []
const Member = []
const Offline = []
let ViewCode;
let websocketList = [];
const socketOn = function (io, app) {
    io.on('connection', (socket) => {
        // 發送用戶相關資訊到客戶端
        socket.emit('viewcode', RoomViewCode);
        socket.emit('qsname', qsname);
        //chat
        socket.on('RoomCode', async function (data) {
            if (data) {
                const checkroom = await Room.findOne({
                    RoomCode: data.RoomCode
                });
                if (checkroom) {
                    socket.join(data.RoomCode);
                    io.sockets.to(data.RoomCode).emit('enter', data.myName)
                    //new Date() > checkroom.expirationDate 不可以聊天
                    if (new Date() > checkroom.expirationDate) {
                        io.sockets.to(data.RoomCode).emit('overtime');
                    }
                    //new Date() <= checkroom.expirationDate 可以聊天
                    if (new Date() <= checkroom.expirationDate) {
                        //---Video
                        socket.on('peer', id => {
                            console.log('peer', id)
                           /* io.to(data.RoomCode).broadcast.emit('user-connected', id);
                            socket.on('disconnect', () => {
                                io.to(data.RoomCode).broadcast.emit('user-disconnected', id)
                            })*/
                        })
                        //---Video
                        //發送訊息
                        socket.on('message', async function (MessageData) {
                            if (data.myName == MessageData.username) {
                                const message = new MassageHistory({
                                    RoomCode: data.RoomCode,
                                    username: MessageData.username,
                                    time: MessageData.time,
                                    content: MessageData.message
                                });
                                await message.save();
                            }
                            // 向該房間內的 socket 進行廣播，通知有新訊息
                            io.sockets.to(data.RoomCode).emit('receive', MessageData);
                        });
                    }
                    // 歷史聊天
                    const latestChatHistory = await MassageHistory.find({
                        RoomCode: data.RoomCode
                    });
                    if (latestChatHistory) {
                        const ChatHistory = await MassageHistory.find({
                            RoomCode: data.RoomCode
                        }).sort({
                            _id: -1
                        }).limit(20);
                        const History = ChatHistory.reverse();
                        socket.emit('History', History);

                        socket.on('needMoreChat', async function (datas) {
                            const ChatHistory = await MassageHistory.find({
                                RoomCode: data.RoomCode
                            }).sort({
                                _id: -1
                            }).skip(datas).limit(10);
                            const History = ChatHistory;
                            if (History) {
                                socket.emit('TenMoreChat', History);
                            }
                        });
                    }
                    // online
                    Member[data.RoomCode] = Member[data.RoomCode] || [];
                    Online[data.RoomCode] = Online[data.RoomCode] || [];
                    Offline[data.RoomCode] = Offline[data.RoomCode] || [];
                    const studentsOnline = await student.findOne({
                        name: data.myName
                    });
                    if (studentsOnline != null) {
                        Online[data.RoomCode].push(studentsOnline)
                    } else {
                        const teachersOnline = await teacher.findOne({
                            name: data.myName
                        });
                        if (teachersOnline != null) {
                            Online[data.RoomCode].push(teachersOnline)
                        }
                    }
                    const sortedOnline = Online[data.RoomCode].sort((a, b) => b.Lv - a.Lv);
                    //console.log('Online[data.RoomCode]', Online[data.RoomCode])
                    io.to(data.RoomCode).emit('RoomMemberOnline', sortedOnline);
                    //------offline

                    const studentmember = await student.find({
                        _id: {
                            $in: checkroom.Member
                        }
                    });
                    const teachermember = await teacher.find({
                        _id: {
                            $in: checkroom.Member
                        }
                    });
                    Member[data.RoomCode] = studentmember.concat(teachermember)
                    Offline[data.RoomCode] = Member[data.RoomCode].filter(member => {
                        return !Online[data.RoomCode].some(onlineMember => onlineMember.name === member.name);
                    });
                    io.to(data.RoomCode).emit('RoomMemberOffline', Offline[data.RoomCode]);

                    socket.on('disconnect', function () {
                        const userIndex = Online[data.RoomCode].findIndex(user => user.name === data.myName);
                        console.log(userIndex)
                        if (userIndex !== -1) {
                            // 用戶在 Online[data.RoomCode] 中，將其刪除
                            const removedUser = Online[data.RoomCode].splice(userIndex, 1)[0];
                            console.log(`用戶 ${removedUser.name} 已離線`);

                            // 更新房間內的成員列表
                            io.to(data.RoomCode).emit('RoomMemberOnline', Online[data.RoomCode]);
                            // 更新離線列表
                            Offline[data.RoomCode].push(removedUser);
                            io.to(data.RoomCode).emit('RoomMemberOffline', Offline[data.RoomCode]);

                        }
                        socket.leave(data.RoomCode);
                        io.sockets.to(data.RoomCode).emit('out', data.myName);
                    })
                }
            }
        });
        //qus

        socket.on('QusRoomCode', async function (data) {
            const checkroom = await Room.findOne({
                RoomCode: data.RoomCode
            });
            if (checkroom && new Date() <= checkroom.expirationDate) {
                socket.join(data.RoomCode);
                socket.on('dataBata', async function (datas) {
                    io.sockets.to(data.RoomCode).emit('playgame', datas)
                    checkroom.questions.push({
                        questionBankText: datas.Itemname,
                        questionText: datas.topic,
                        correctOption: datas.correctOption
                    })
                    await checkroom.save()
                });
                socket.on('qusTrue', async function (dataTrue) {
                    console.log("True");
                    const checkroom = await Room.findOne({
                        RoomCode: data.RoomCode
                    });
                    const QUE = checkroom.questions[checkroom.questions.length - 1];
                    QUE.userAnswers.push({
                        userId: dataTrue.id,
                        questionText: dataTrue.data.qus,
                        state: dataTrue.state
                    });
                    await checkroom.save()
                });

                socket.on('qusFalse', async function (dataFalse) {
                    console.log("False");
                    const checkroom = await Room.findOne({
                        RoomCode: data.RoomCode
                    });
                    const QUE = checkroom.questions[checkroom.questions.length - 1];
                    QUE.userAnswers.push({
                        userId: dataFalse.id,
                        questionText: dataFalse.data.qus,
                        state: dataFalse.state
                    });
                    await checkroom.save()
                });

                socket.on('qusState', async function (dataState) {
                    const checkroom = await Room.findOne({
                        RoomCode: data.RoomCode
                    });
                    const QUE = checkroom.questions[checkroom.questions.length - 1];
                    const question = dataState.data.qus;
                    const state = dataState.state;
                    checkroom.Member.forEach(member => {
                        const existingUserAnswer = QUE.userAnswers.find(answer => answer.userId === member && answer.questionText === question && answer.userId !== dataState.id);
                        if (!existingUserAnswer) {
                            QUE.userAnswers.push({
                                userId: member,
                                questionText: question,
                                state: state
                            });
                        }
                    });

                    // 計算答題狀況的百分比
                    const userAnswersCount = {};
                    checkroom.Member.forEach(member => {
                        userAnswersCount[member] = {
                            True: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'True').length,
                            False: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'False').length,
                            Unfinish: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'Unfinish').length,
                        };
                    });

                    // 更新每個問題的答題狀況
                    QUE.userAnswers.forEach(answer => {
                        answer.Truepercent = userAnswersCount[answer.userId].True;
                        answer.Falsepercent = userAnswersCount[answer.userId].False;
                        answer.Unfinishpercent = userAnswersCount[answer.userId].Unfinish;
                    });

                    const trueUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'True').length;
                    const FalseUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'False').length;
                    const UnfinishUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'Unfinish').length - 1;
                    const memberCount = checkroom.Member.length - 1;
                    const truePercentage = (trueUserAnswersCount / memberCount) * 100;
                    const FalsePercentage = (FalseUserAnswersCount / memberCount) * 100;
                    const UnfinishPercentage = (UnfinishUserAnswersCount / memberCount) * 100;

                    QUE.answerCounts = {
                        trueCount: trueUserAnswersCount,
                        falseCount: FalseUserAnswersCount,
                        unfinishCount: UnfinishUserAnswersCount,
                    };

                    QUE.answerPercentages = {
                        truePercentage: truePercentage,
                        falsePercentage: FalsePercentage,
                        unfinishPercentage: UnfinishPercentage,
                    };

                    await checkroom.save();

                    console.log('True 答案的數量：', trueUserAnswersCount);
                    console.log('False 答案的數量：', FalseUserAnswersCount);
                    console.log('Unfinish 答案的數量：', UnfinishUserAnswersCount);
                    console.log('True 的百分比：', truePercentage);
                    console.log('False 的百分比：', FalsePercentage);
                    console.log('Unfinish 的百分比：', UnfinishPercentage);
                    console.log('計算 Room 的 答題者數量：', memberCount);


                    io.sockets.to(data.RoomCode).emit('percent', {
                        truePercentage,
                        question
                    })
                })

                socket.on('noqus', function () {
                    console.log("noqus");
                });
            }
        });
    });

};


// 匯出模組
module.exports = {
    socketOn,
    ViewRoomCode,
    Qsname
};