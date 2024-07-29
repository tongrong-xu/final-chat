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
async function createGroups(memberIds) {
    let shuffledMembers = memberIds.sort(() => 0.5 - Math.random());
    const totalMembers = shuffledMembers.length;
    let groupCount = Math.max(2, Math.ceil(totalMembers / 3));

    let groups = [];
    let remainingMembers = totalMembers;

    for (let i = 0; i < groupCount; i++) {
        let groupSize = Math.ceil(remainingMembers / (groupCount - i));
        let groupMemberIds = shuffledMembers.splice(0, groupSize);
        remainingMembers -= groupSize;

        let groupMembers = await Promise.all(
            groupMemberIds.map(async memberId => {
                let memberInfo = await student.findOne({
                    _id: memberId
                }, 'name _id Lv').lean();
                if (!memberInfo) {
                    return null;
                }
                return {
                    _id: memberInfo._id.toString(), // 將 ObjectId 轉換為字符串
                    name: memberInfo.name,
                    Lv: memberInfo.Lv
                };
            })
        );

        // 過濾掉任何 null 的結果
        groupMembers = groupMembers.filter(member => member !== null);

        groups.push({
            groupName: `第${i + 1}組`,
            members: groupMembers // 現在 members 是一個對象數組
        });
    }

    return groups;
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

                    //member
                    // 於 socket.js 中新增一個事件監聽器來處理組員資訊的請求
                    socket.on('requestGroupMembers', async (roomId) => {
                        const room = await Room.findOne({
                            RoomCode: roomId
                        });
                        if (!room || !room.groups || room.groups.length === 0) {
                            socket.emit('groupMembersError', '找不到組員資訊或該房間未進行分組');
                            return;
                        }

                        // 假設每個成員都有一個唯一的 ID，並且當前用戶的 ID 已知
                        const currentUserGroupId = room.groups.find(group => group.members.some(member => member._id === socket.userId))?.groupName;

                        if (!currentUserGroupId) {
                            socket.emit('groupMembersError', '找不到當前用戶的組別');
                            return;
                        }

                        // 過濾出當前用戶組的成員
                        const currentGroupMembers = room.groups.find(group => group.groupName === currentUserGroupId).members;

                        // 根據 Online 和 Offline 數組過濾出線上和離線的組員
                        const onlineMembers = currentGroupMembers.filter(member => Online[roomId].some(onlineUser => onlineUser._id === member._id));
                        const offlineMembers = currentGroupMembers.filter(member => !Online[roomId].some(onlineUser => onlineUser._id === member._id));

                        // 將組員資訊發送回客戶端
                        console.log('Sending groupMembersInfo', {
                            onlineMembers,
                            offlineMembers
                        });
                        socket.emit('groupMembersInfo', {
                            onlineMembers,
                            offlineMembers
                        });

                    });


                    //

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
                    io.to(data.RoomCode).emit('RoomMemberStudent', studentsOnline)

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

                    // socket event handling
                    socket.on('message', async function (message) {
                        // 檢查消息是否指定了組別
                        if (message.group) {
                            // 只向同一組的成員發送消息
                            // 假設 `group` 字段包含了組別標識
                            socket.to(message.group).emit('receive', message);
                        } else {
                            // 向房間內所有人發送消息
                            socket.to(message.RoomCode).emit('receive', message);
                        }
                    });


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
        })
        //qus

        socket.on('QusRoomCode', async function (data) {
            const checkroom = await Room.findOne({
                RoomCode: data.RoomCode
            });
            if (checkroom) {
                // 創建一個數組來儲存學生成員
                let studentMembers = [];

                // 迭代房間中的每個成員
                for (let memberId of checkroom.Member) {
                    // 檢查成員是否是學生
                    let studentMember = await student.findOne({
                        _id: memberId
                    });
                    if (studentMember) {
                        // 如果該成員是學生，則添加到列表中
                        studentMembers.push(studentMember);
                    }
                }
                // 向客戶端發送學生成員列表
                if (!checkroom.isGrouped)
                    socket.emit('RoomMemberList', studentMembers)
                else
                    socket.emit('groupingResults', checkroom.groups);

            }
            if (checkroom && new Date() <= checkroom.expirationDate) {
                socket.join(data.RoomCode);
                if (checkroom.isGrouped == true)
                    io.to(data.RoomCode).emit('Teams', checkroom.groups);
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
                    const checkroom = await Room.findOne({
                        RoomCode: data.RoomCode
                    });
                    const memberCount = checkroom.Member.length; // 假設每個房間成員都有資格回答
                    const correctAnswers = checkroom.questions.reduce((acc, cur) => {
                        return acc + (cur.userAnswers.some(answer => answer.state === 'True') ? 1 : 0);
                    }, 0);
                    const hp = 1000 / (memberCount - 1);
                    io.sockets.to(data.RoomCode).emit('reduceHealth', hp);

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
                    const questionCreatorId = dataState.id; // 出題者的 ID

                    // 排除出題者
                    const filteredMembers = checkroom.Member.filter(member => member !== questionCreatorId);

                    // 遍歷成員並將答案添加到問題中
                    filteredMembers.forEach(member => {
                        const existingUserAnswer = QUE.userAnswers.find(answer =>
                            answer.userId === member &&
                            answer.questionText === question
                        );
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
                    filteredMembers.forEach(member => {
                        userAnswersCount[member] = {
                            True: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'True').length,
                            False: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'False').length,
                            Unfinish: QUE.userAnswers.filter(answer => answer.userId === member && answer.state === 'Unfinish').length,
                        };
                    });

                    // 更新每個問題的答題狀況
                    QUE.userAnswers.forEach(answer => {
                        if (userAnswersCount[answer.userId]) {
                            answer.Truepercent = userAnswersCount[answer.userId].True;
                            answer.Falsepercent = userAnswersCount[answer.userId].False;
                            answer.Unfinishpercent = userAnswersCount[answer.userId].Unfinish;
                        }
                    });

                    // 計算各狀態的答題數量
                    const trueUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'True').length;
                    const falseUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'False').length;
                    const unfinishUserAnswersCount = QUE.userAnswers.filter(answer => answer.state === 'Unfinish').length;
                    const memberCount = filteredMembers.length; // 使用過濾後的成員數量

                    // 確保不會出現除以零的情況
                    const truePercentage = memberCount === 0 ? 0 : (trueUserAnswersCount / memberCount) * 100;
                    const falsePercentage = memberCount === 0 ? 0 : (falseUserAnswersCount / memberCount) * 100;
                    const unfinishPercentage = memberCount === 0 ? 0 : (unfinishUserAnswersCount / memberCount) * 100;

                    QUE.answerCounts = {
                        trueCount: trueUserAnswersCount,
                        falseCount: falseUserAnswersCount,
                        unfinishCount: unfinishUserAnswersCount,
                    };

                    QUE.answerPercentages = {
                        truePercentage: truePercentage,
                        falsePercentage: falsePercentage,
                        unfinishPercentage: unfinishPercentage,
                    };

                    await checkroom.save();

                    console.log('True 答案的數量：', trueUserAnswersCount);
                    console.log('False 答案的數量：', falseUserAnswersCount);
                    console.log('Unfinish 答案的數量：', unfinishUserAnswersCount);
                    console.log('True 的百分比：', truePercentage);
                    console.log('False 的百分比：', falsePercentage);
                    console.log('Unfinish 的百分比：', unfinishPercentage);
                    console.log('計算 Room 的成員數量（不包含出題者）：', memberCount);

                    const correctRate = memberCount > 0 ? (trueUserAnswersCount / memberCount) * 100 : 0;
                    console.log(`答對率: ${correctRate}%`);

                    if (correctRate >= 70) {
                        console.log('應該發送win事件');
                        io.sockets.to(data.RoomCode).emit('win');
                    } else {
                        console.log('應該發送lose事件');
                        io.sockets.to(data.RoomCode).emit('lose');
                    }

                    io.sockets.to(data.RoomCode).emit('percent', {
                        truePercentage,
                        question
                    });
                });

                socket.on('noqus', function () {
                    console.log("noqus");
                });

                socket.on('requestGrouping', async (datas) => {
                    try {
                        const checkroom = await Room.findOne({
                            RoomCode: datas.RoomCode
                        });

                        // 檢查是否找到了房間
                        if (!checkroom) {
                            socket.emit('groupingError', '未找到房間');
                            return;
                        }

                        // 檢查是否已經分過組
                        if (checkroom.isGrouped) {
                            socket.emit('groupingError', '已經分過組了');
                            return;
                        }

                        // 執行分組邏輯
                        const groups = await createGroups(datas.memberIds);
                        checkroom.groups = groups;
                        checkroom.isGrouped = true;
                        await checkroom.save();

                        // 將分組結果發送給前端
                        io.to(datas.RoomCode).emit('groupingResult', checkroom.groups);
                    } catch (error) {
                        console.error('分組錯誤:', error);
                        socket.emit('groupingError', '分組過程中發生錯誤');
                    }
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