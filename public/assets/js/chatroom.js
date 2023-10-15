$(document).ready(function () {
    const messageSendBtn = $("#send-message");
    const messageInput = $("#message-input");
    const chatroomCon = $("#chatroom-con")
    const barrageContainer = $("#barrageContainer");
    const right = $(".right");
    //--------------------socket--------------------

    const socket = io();
    const connect = 'connect';
    let needchat = 10;
    let isScrolling = false;
    //let roommyname = ''
    const usernameElement = document.getElementById('username');
    usernameElement.textContent = ''
    const userLvElement = document.getElementById('userLv');
    const memberListContainer = document.getElementById('members-con');
    const useridElement = document.getElementById('myid');


    const fullUrl = window.location.href;
    const roomCode = fullUrl.split('/').pop();
    const RoomCode = roomCode.replace('Room_', '');
    memberListContainer.innerHTML = '';

    $.ajax({
        url: '/home/rooms/classroomData', // 請將路由設置為返回用戶資料的路由
        type: 'GET',
        success: function (data) {
            // 在這裡處理從後端獲取的資料
            console.log('用戶資料：', data);
            usernameElement.textContent = data.Name ? data.Name : 'name is unknown';
            userLvElement.textContent = data.Lv ? 'Lv.' + data.Lv : 'Lv is unknown';
            useridElement.value = data.id
            //---
            var messageObj = {
                username: data.Name,
                time: "00:00",
                message: "",
                color: "white",
                type: 0
            };

            messageSendBtn.click(function () {
                messageObj["message"] = messageInput.val();
                if (messageObj["message"] != "") {
                    messageObj["time"] = getCurrentTime();
                    if (toggleBarrageOpen == true) {
                        socket.emit('message', messageObj)
                    }

                    messageInput.val("");
                }
            });

            //建立彈幕
            function createBarrage(text, color = "black", type = 0) {
                // 創建彈幕元素
                const barrageElement = $('<div class="barrage"></div>').text(text);
                barrageContainer.append(barrageElement);

                // 隨機設置彈幕的垂直位置
                const minTop = 0;
                const maxTop = barrageContainer.height() - barrageElement.outerHeight();

                const equallyRandom = Math.random().toFixed(1);

                const randomTop = Math.floor(equallyRandom * (maxTop - minTop + 1) + minTop);
                barrageElement.css("top", randomTop);
                barrageElement.css("color", color);

                // 將彈幕元素的 left 位置設置為 barrageContainer 的寬度，使彈幕元素一開始位於容器的右邊界之外
                barrageElement.css("left", barrageContainer.width() - right.width());

                // 將彈幕從右側滾動到畫面左側
                barrageElement.animate({
                    left: -barrageElement.outerWidth()
                }, {
                    duration: 7000,
                    easing: "linear",
                    complete: function () {
                        barrageElement.remove();
                    }
                });

                // 滑鼠進入彈幕時停止動畫
                barrageElement.mouseenter(function () {
                    barrageElement.stop();
                });

                // 滑鼠離開彈幕時重新啟動動畫
                barrageElement.mouseleave(function () {
                    var currentLeft = parseFloat(barrageElement.css("left"));
                    var remainingDistance = barrageElement.outerWidth() + currentLeft;
                    var remainingTime = (remainingDistance / barrageContainer.width()) * 7000;

                    barrageElement.animate({
                        left: -barrageElement.outerWidth()
                    }, {
                        duration: remainingTime,
                        easing: "linear",
                        complete: function () {
                            barrageElement.remove();
                        }
                    });
                });
            }


            //--------------------------選色-------------------
            const colorBtn = $(".color-btn");

            colorBtn.click(function () {
                var clickItem = $(this);

                colorBtn.each(function (index, element) {
                    $(element).css("filter", "brightness(1)");
                });

                clickItem.css("filter", "brightness(0.8)");
                messageObj["color"] = clickItem.attr("color");
            });

            //---------------------開關彈幕-----------------
            const toggleBarrage = $("#toggle-Barrage");
            var toggleBarrageOpen = true; //預設開啟



            toggleBarrage.click(function () {
                if (toggleBarrage.attr("now") == "open") {
                    toggleBarrage.attr("now", "close");
                    toggleBarrageOpen = false;
                    $(".barrage").remove();
                } else if (toggleBarrage.attr("now") == "close") {
                    toggleBarrage.attr("now", "open");
                    toggleBarrageOpen = true;
                }
            })
            //---

            // 取得時間
            function getCurrentTime() {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const timeString = `${hours}:${minutes}`;
                return timeString;
            }

            // 製作成JSON格式
            function CreatJsonMessage() {
                // 轉為json
                var messagJson = JSON.stringify(messageObj);

                //json轉obj
                messageObj = JSON.parse(messagJson);

            }

            //---socket
            socket.on('connect', function () {
                console.log(RoomCode)

                socket.emit('RoomCode', {
                    RoomCode: RoomCode,
                    myName: data.Name
                })

                socket.on('enter', (data) => {
                    const text = data + ' is join'
                    createBarrage(text, "black", 0);
                })

                socket.on('overtime', () => {
                    const text = '房間已過期，無法發送新消息'
                    createBarrage(text, "black", 0);
                })

                socket.on('out', (data) => {
                    const text = data + ' is leave'
                    createBarrage(text, "black", 0);
                })

                //發送訊息
                socket.on('receive', function (Obj) {
                    createBarrage(Obj.message, Obj.color, Obj.type);
                    var messageDiv = $('<div class="col-12 message"></div>').text(Obj.message);
                    var messageDivString = messageDiv.html();
                    if (data.Name == Obj.username) {
                        var $msg = `
                    <div class="col row message-username-self-con" id="message-con">
                    <div class="col-3 message-username-self">${Obj.username}</div>
                    <div class="col-9 message-time">${Obj.time}</div>
                    ${messageDivString}
                    </div>
                    <hr>`;
                    } else {
                        var $msg = `
                        <div class="col row " >
                        <div class="col-3 message-username">${Obj.username}</div>
                        <div class="col-9 message-time">${Obj.time}</div>
                        ${messageDivString}
                        </div>
                        <hr>`;
                    }
                    chatroomCon.append($msg);
                    scrollMessage()
                })
                socket.on('History', function (History) {
                    // 清空聊天視窗
                    chatroomCon.html('');

                    // 遍歷資料並印出每個訊息
                    History.forEach(messageData => {
                        const messageDiv = $('<div class="col-12 message"></div>').text(messageData.content);
                        const messageDivString = messageDiv.html();
                        let $msg = '';

                        if (data.Name == messageData.username) {
                            // 自己的訊息
                            $msg = `
                                <div class="col row message-username-self-con" id="message-con">
                                    <div class="col-3 message-username-self">${messageData.username}</div>
                                    <div class="col-9 message-time">${messageData.time}</div>
                                    ${messageDivString}
                                </div>
                                <hr>`;
                        } else {
                            // 其他人的訊息
                            $msg = `
                                <div class="col row " >
                                    <div class="col-3 message-username">${messageData.username}</div>
                                    <div class="col-9 message-time">${messageData.time}</div>
                                    ${messageDivString}
                                </div>
                                <hr>`;
                        }
                        chatroomCon.append($msg);

                        chatroomCon.scroll(function () {
                            if (!isScrolling && $(this).scrollTop() === 0) {
                                // 如果已經滾動到頂部，則向伺服器請求更多訊息
                                isScrolling = true;
                                needchat = needchat + 10
                                need()
                            }

                            function need() {
                                socket.emit('needMoreChat', needchat);

                            }
                            setTimeout(function () {
                                isScrolling = false;
                            }, 1000);
                        });

                    });
                    scrollMessage()
                });
                socket.on('TenMoreChat', function (TMC) {
                    // 遍歷資料並印出每個訊息
                    TMC.forEach(messageData => {
                        const messageDiv = $('<div class="col-12 message"></div>').text(messageData.content);
                        const messageDivString = messageDiv.html();
                        let $msg = '';

                        if (data.Name == messageData.username) {
                            // 自己的訊息
                            $msg = `
                                <div class="col row message-username-self-con" id="message-con">
                                    <div class="col-3 message-username-self">${messageData.username}</div>
                                    <div class="col-9 message-time">${messageData.time}</div>
                                    ${messageDivString}
                                </div>
                                <hr>`;
                        } else {
                            // 其他人的訊息
                            $msg = `
                                <div class="col row " >
                                    <div class="col-3 message-username">${messageData.username}</div>
                                    <div class="col-9 message-time">${messageData.time}</div>
                                    ${messageDivString}
                                </div>
                                <hr>`;
                        }
                        chatroomCon.prepend($msg);
                    });
                    chatroomCon.scrollTop(43.5 * TMC.length)
                });
                socket.on('RoomMemberOnline', (RMonline) => {
                    memberListContainer.innerHTML = '<p>線上</p>'
                    if (RMonline) {
                        RMonline.forEach(member => {
                            const memberDiv = document.createElement('div');
                            if (data.Name == member.name) {
                                memberDiv.className = 'col row member-username-self-con';
                                memberDiv.innerHTML = `
                                <div class="col-3" id="header" style="background-color: green;">
                                <img src="#" alt="">
                            </div>
                                <div class="col-3 member-username-self">${member.name}</div>
                                <div class="col-6 member-lv">Lv.${member.Lv}</div>
                                <hr>
                            `;
                                memberListContainer.appendChild(memberDiv);
                            } else {
                                memberDiv.className = 'col row';
                                memberDiv.innerHTML = `
                                <div class="col-3" id="header" style="background-color: green;">
                                    <img src="#" alt="">
                                </div>
                                <div class="col-3 member-username">${member.name}</div>
                                <div class="col-6 member-lv">Lv.${member.Lv}</div>
                                <hr>
                            `;
                                memberListContainer.appendChild(memberDiv);
                            }
                        });
                    } else {
                        console.log("unknown");
                    }
                });

                socket.on('RoomMemberOffline', (RMOffline) => {
                    const Offline = document.createElement('div');
                    Offline.innerHTML = `<p>離線</p>`;
                    memberListContainer.appendChild(Offline)
                    if (RMOffline) {
                        RMOffline.forEach(member => {
                            const memberDiv = document.createElement('div');
                            if (data.Name == member.name) {
                                memberDiv.className = 'col row member-username-self-con';
                                memberDiv.innerHTML = `
                                <div class="col-3" id="header" style="background-color: green;">
                                <img src="#" alt="" >
                                </div>
                                <div class="col-3 member-username-self">${member.name}</div>
                                <div class="col-6 member-lv">Lv.${member.Lv}</div>
                                <hr>
                            `;
                                memberListContainer.appendChild(memberDiv);
                            } else {
                                memberDiv.className = 'col row';
                                memberDiv.innerHTML = `
                                <div class="col-3" id="header">
                                    <img src="#" alt="">
                                </div>
                                <div class="col-3 member-username">${member.name}</div>
                                <div class="col-6 member-lv">Lv.${member.Lv}</div>
                                <hr>
                            `;
                                memberListContainer.appendChild(memberDiv);
                            }
                        });
                    } else {
                        console.log("unknown");
                    }
                });
                socket.on('disconnect', function () {
                    window.location.href = `/home`;
                });

            })

        },
        error: function (error) {
            console.error('發生錯誤：', error);
        }
    });

    $.ajax({
        url: '/home/rooms/roomTime',
        type: 'POST',
        data: {
            data: RoomCode
        },
        success: function (data) {
            // 將目標時間解析為 Date 對象
            const targetDate = new Date(data.time);

            // 更新剩余時間的函數
            function updateCountdown() {
                const currentDate = new Date();
                const timeDifference = targetDate - currentDate;

                if (timeDifference <= 0) {
                    // 目標時間已過，執行相應操作
                    //clearInterval(interval);
                    document.getElementById('countdown').innerHTML = "時間已過！";

                    //---socket
                    socket.on('connect', function () {
                        socket.emit('overtime');
                    })
                } else {
                    // 計算剩余的小時、分鐘和秒
                    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                    // 在頁面上顯示剩余時間
                    document.getElementById('countdown').innerHTML = `剩余時間：${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`;
                }
            }

            // 頁面加載時啟動倒計時
            updateCountdown();

            // 每秒更新一次剩余時間
            const interval = setInterval(updateCountdown, 1000);
        },
        error: function (error) {
            console.error('發生錯誤：', error);
        }
    });

    $("#message-input").keyup(function (event) {
        if (event.which === 13) {
            messageSendBtn.click(); //觸發發送訊息
        }
    });
    const leaveroom = $("#leave-room");

    leaveroom.click(function () {
        window.location.href = `/home`;
    })

    function scrollMessage() {
        chatroomCon.scrollTop(chatroomCon[0].scrollHeight);
    }
});