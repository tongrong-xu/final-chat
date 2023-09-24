const Room = require("./models/room");
const student = require("./models/student");
const teacher = require("./models/teacher");
const MassageHistory = require("./models/chathistory");
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
const socketOn = function (io) {
    io.on('connection', (socket) => {

        // 發送用戶相關資訊到客戶端
        socket.emit('viewcode', RoomViewCode);
        socket.emit('qsname', qsname);

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
                    console.log('checkroommember', checkroom.Menber)
                    io.to(data.RoomCode).emit('RoomMemberOnline', Online[data.RoomCode]);
                    //------offline`

                    const studentmember = await student.find({
                        _id: {
                            $in: checkroom.Menber
                        }
                    });
                    const teachermember = await teacher.find({
                        _id: {
                            $in: checkroom.Menber
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
    });
};

// 匯出模組
module.exports = {
    socketOn,
    ViewRoomCode,
    Qsname
};