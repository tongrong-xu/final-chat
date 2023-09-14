const Room = require("./models/room");
const student = require("./models/student");
const teacher = require("./models/teacher");
const MassageHistory = require("./models/chathistory");
const {
    v4: uuidv4
} = require('uuid');
// 宣告全域變數
let userName;
let userLv;
let userrole;
let roomCode;
let RoomViewCode;
let homename;
let homerole;
let homeLv;
let qsname;
let TopicView;

function QSTopicView(View) {
    TopicView = View;
}

function HomeName(name) {
    homename = name;
}

function Homerole(role) {
    homerole = role;
}

function HomeLv(Lv) {
    homeLv = Lv;
}
// 設定用戶名稱
function setUserName(name) {
    userName = name;
}

// 設定用戶等級
function setUserLv(lv) {
    userLv = lv;
}

// 設定用戶角色
function setUserrole(role) {
    userrole = role;
}

// 設定房間代碼
function SetRoomCode(code) {
    roomCode = code;
}

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
const connectedUsers = {};
let userId
const socketOn = function (io) {
    io.on('connection', (socket) => {

        socket.on('login', (userName) => {
            // 在伺服器中儲存用戶狀態，使用 UUID 生成唯一識別碼
            userId = uuidv4();
            let userExists = false;
            for (const userId in connectedUsers) {
                if (connectedUsers.hasOwnProperty(userId) && connectedUsers[userId].userName === userName) {
                    userExists = true;
                    break;
                }
            }

            if (!userExists && userName != null && userLv != null && userrole != null) {
                connectedUsers[userId] = {
                    userName,
                    userLv,
                    userrole
                };
            }
            // 發送用戶識別碼給客戶端，客戶端在重新連接時使用它
            //console.log(connectedUsers)
            //socket.emit('userId', connectedUsers[userId]);
        });
        // 發送用戶相關資訊到客戶端
        socket.emit('homename', homename);
        socket.emit('homelevel', homeLv);
        socket.emit('homerole', homerole);
        socket.emit('username', userName);
        socket.emit('level', userLv);
        socket.emit('role', userrole);
        socket.emit('RoomCode', roomCode);
        socket.emit('viewcode', RoomViewCode);
        socket.emit('qsname', qsname);
        socket.emit('TopicView', TopicView);
        socket.on('entercode', async function (roomdata) {
            console.log(userId)
            socket.emit('myname', userName)
            console.log('userName', userName)
            socket.emit('mylv', userLv)
            if (roomdata) {
                const checkroom = await Room.findOne({
                    RoomCode: roomdata
                });
                Member[roomdata] = Member[roomdata] || [];
                Online[roomdata] = Online[roomdata] || [];
                const latestChatHistory = await MassageHistory.find({
                    RoomCode: roomdata
                });
                const namedatas = userName
                const member = checkroom.Menber
                console.log('member', member)
                if (checkroom && new Date() > checkroom.expirationDate) {
                    console.log('房間已過期，無法發送新消息。');
                    const overtime = "房間已過期，無法發送新消息"
                    // 讓用戶加入房間
                    socket.join(roomdata);
                    // 向該房間內的 socket 進行廣播，通知有用戶加入
                    if (userName) {
                        io.sockets.to(roomdata).emit('enter', namedatas);
                        io.sockets.to(roomdata).emit('overtime', overtime);
                    }
                    if (latestChatHistory) {
                        const ChatHistory = await MassageHistory.find({
                            RoomCode: roomdata
                        }).sort({
                            _id: -1
                        }).limit(20);
                        const History = ChatHistory.reverse();
                        socket.emit('History', History);

                        socket.on('needMoreChat', async function (datas) {
                            const ChatHistory = await MassageHistory.find({
                                RoomCode: roomdata
                            }).sort({
                                _id: -1
                            }).skip(datas).limit(10);
                            const History = ChatHistory;
                            if (History) {
                                socket.emit('TenMoreChat', History);
                            }
                        });
                    }
                    //-----online
                    const studentsOnline = await student.findOne({
                        name: namedatas
                    });
                    if (studentsOnline) {
                        Online[roomdata].push(studentsOnline)
                    } else {
                        const teachersOnline = await teacher.findOne({
                            name: namedatas
                        });
                        if (teachersOnline) {
                            Online[roomdata].push(teachersOnline)
                        }
                    }
                    console.log('Online[roomdata]', Online[roomdata])
                    io.to(roomdata).emit('RoomMemberOnline', Online[roomdata]);
                    //------
                    //------offline`

                    const studentmember = await student.find({
                        name: {
                            $in: member
                        }
                    });
                    const teachermember = await teacher.find({
                        name: {
                            $in: member
                        }
                    });
                    Member[roomdata] = studentmember.concat(teachermember)

                    Offline[roomdata] = Member[roomdata].filter(member => {
                        return !Online[roomdata].some(onlineMember => onlineMember.name === member.name);
                    });
                    console.log(' Offline[roomdata]', Offline[roomdata])
                    io.to(roomdata).emit('RoomMemberOffline', Offline[roomdata]);

                    //------

                    // 監聽用戶斷線事件

                    socket.on('disconnect', function () {

                        //-----online
                        const userIndex = Online[roomdata].findIndex(user => user.name === userName);
                        console.log(userIndex)
                        if (userIndex !== -1) {
                            // 用戶在 Online[roomdata] 中，將其刪除
                            const removedUser = Online[roomdata].splice(userIndex, 1)[0];
                            console.log(`用戶 ${removedUser.name} 已離線`);

                            // 更新房間內的成員列表
                            io.to(roomdata).emit('RoomMemberOnline', Online[roomdata]);
                            // 更新離線列表
                            Offline[roomdata].push(removedUser);
                            io.to(roomdata).emit('RoomMemberOffline', Offline[roomdata]);
                        }

                        socket.leave(roomdata);
                        io.sockets.to(roomdata).emit('out', userName);
                    })
                } else if (checkroom && new Date() <= checkroom.expirationDate) {
                    // 讓用戶加入房間
                    socket.join(roomdata);
                    // 向該房間內的 socket 進行廣播，通知有用戶加入
                    if (userName) {
                        io.sockets.to(roomdata).emit('enter', namedatas);
                    }
                    if (latestChatHistory) {
                        const ChatHistory = await MassageHistory.find({
                            RoomCode: roomdata
                        }).sort({
                            _id: -1
                        }).limit(20);
                        const History = ChatHistory.reverse();
                        socket.emit('History', History);

                        socket.on('needMoreChat', async function (datas) {
                            const ChatHistory = await MassageHistory.find({
                                RoomCode: roomdata
                            }).sort({
                                _id: -1
                            }).skip(datas).limit(10);
                            const History = ChatHistory;
                            if (History) {
                                socket.emit('TenMoreChat', History);
                            }
                        });
                    }
                    //-----online
                    console.log('namedatas:', namedatas)
                    const studentsOnline = await student.findOne({
                        name: namedatas
                    });
                    if (studentsOnline != null) {
                        Online[roomdata].push(studentsOnline)
                        console.log('studentsOnline', studentsOnline)
                    } else {
                        const teachersOnline = await teacher.findOne({
                            name: namedatas
                        });
                        if (teachersOnline != null) {
                            console.log('teachersOnline', teachersOnline)
                            Online[roomdata].push(teachersOnline)
                        }
                    }

                    console.log('Online[roomdata]', Online[roomdata])
                    io.to(roomdata).emit('RoomMemberOnline', Online[roomdata]);
                    //------
                    //------offline`

                    const studentmember = await student.find({
                        name: {
                            $in: member
                        }
                    });
                    const teachermember = await teacher.find({
                        name: {
                            $in: member
                        }
                    });
                    Member[roomdata] = studentmember.concat(teachermember)
                    console.log('Member[roomdata]', Member[roomdata])
                    Offline[roomdata] = Member[roomdata].filter(member => {
                        return !Online[roomdata].some(onlineMember => onlineMember.name === member.name);
                    });
                    console.log('Offline[roomdata]', Offline[roomdata])
                    io.to(roomdata).emit('RoomMemberOffline', Offline[roomdata]);

                    //------

                    // 監聽用戶斷線事件

                    socket.on('disconnect', function () {

                        //-----online
                        const userIndex = Online[roomdata].findIndex(user => user.name === userName);
                        console.log(userIndex)
                        if (userIndex !== -1) {
                            // 用戶在 Online[roomdata] 中，將其刪除
                            const removedUser = Online[roomdata].splice(userIndex, 1)[0];
                            console.log(`用戶 ${removedUser.name} 已離線`);

                            // 更新房間內的成員列表
                            io.to(roomdata).emit('RoomMemberOnline', Online[roomdata]);
                            // 更新離線列表
                            Offline[roomdata].push(removedUser);
                            io.to(roomdata).emit('RoomMemberOffline', Offline[roomdata]);

                        }

                        socket.leave(roomdata);
                        io.sockets.to(roomdata).emit('out', userName);
                    })

                    // 監聽用戶發送訊息事件
                    socket.on('message', async function (datas) {
                        const message = new MassageHistory({
                            RoomCode: roomdata,
                            username: datas.username,
                            time: datas.time,
                            content: datas.message
                        });
                        await message.save();
                        // 向該房間內的 socket 進行廣播，通知有新訊息
                        io.sockets.to(roomdata).emit('receive', datas);
                    });
                }
            }
        });
    });
};

// 匯出模組
module.exports = {
    socketOn,
    setUserName,
    setUserLv,
    setUserrole,
    SetRoomCode,
    ViewRoomCode,
    HomeName,
    Homerole,
    HomeLv,
    Qsname,
    QSTopicView
};