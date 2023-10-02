$(document).ready(function () {

    //------------------控制顯示介面--------------------
    const createRoom = $("#create-room");
    const createRoom2 = $("#create-room2");
    const openRoomListBtn = $("#open-room-list");

    const createRoomBoard = $("#create-room-con");
    const joineRoomBoard = $(".join-room-con");

    createRoom2.click(function (event) {
        event.preventDefault();
        roomHistoryReplay.each(function () {
            $(this).css("background-color", "");
        });
        if (joineRoomBoard.css("display") != "none") {
            joineRoomBoard.fadeOut(200, function () {
                createRoomBoard.fadeIn();
            });
        }
    });

    openRoomListBtn.click(OpenRoomList);

    function OpenRoomList() {
        roomHistoryReplay.each(function () {
            $(this).css("background-color", "");
        });
        if (createRoomBoard.css("display") != "none") {
            createRoomBoard.fadeOut(200, function () {
                joineRoomBoard.fadeIn();
            });
        }
        if (joineRoomBoard.css("display") == "none") {
            joineRoomBoard.fadeIn();
        }
        // if(replayBoard.css("display") != "none"){
        //     replayBoard.fadeOut(200,function(){
        //         joineRoomBoard.fadeIn();
        //     });
        // }
        replayCon.slideUp(250);
        playRecordListCon.slideUp(250, function () {
            roomListCon.slideDown();
        });
    }



    //--------------------顯示遊玩紀錄--------------------

    // 查詢房間紀錄
    const replayBoard = $(".replay-information");

    var roomHistoryReplay = $(".roomHistory");

    //點擊後顯示房間詳細資訊
    roomHistoryReplay.click(function () {
        if (createRoomBoard.css("display") != "none") {
            createRoomBoard.fadeOut(200, function () {
                replayBoard.fadeIn();
            });
        }
        if (joineRoomBoard.css("display") != "none") {
            joineRoomBoard.fadeOut(200, function () {
                replayBoard.fadeIn();
            });
        }

        //提取房間資訊
        var roomHistoryReplayInfor = {
            name: $(this).find(".room-name").text(),
            roomId: $(this).attr("room-id"),
            date: $(this).find(".date").text(),
            type: $(this).find(".room-type").text(),
            qusType: $(this).find(".room-qus-type").text(),
            rand: $(this).find(".rank").text()
        };

        roomHistoryReplay.each(function () {
            $(this).css("background-color", "");
        });
        $(this).css("background-color", "rgb(230,230,230)")

        replayBoard.find(".room-name").text(roomHistoryReplayInfor["name"]);
        replayBoard.find(".room-id").text("ID:" + roomHistoryReplayInfor["roomId"]);
        replayBoard.find(".room-type").text(roomHistoryReplayInfor["type"]);
        replayBoard.find(".room-qus-type").text(roomHistoryReplayInfor["qusType"]);
    });


    //----------------------加入房間---------------------
    const canJoinRoom = $(".canJoinRoom");
    const canJoinRoomCon = $("#can-join-room-con");

    //加入房間
    canJoinRoomCon.on("click", ".canJoinRoom", function () {
        joinRoom($(this));
    })

    function joinRoom(obj) {
        var roomId = obj.find(".room-id").attr("room-id");
        console.log("你加入了" + roomId + "房間");
    }


    //------------------------新增房間------------------

    const createRoomSub = $("#create-room-submit");
    const backToRoomList = $("#back-to-room-list");

    backToRoomList.click(function (event) {
        event.preventDefault();
        OpenRoomList();
    })

    //創建房間
    createRoomSub.click(function (event) {
        // event.preventDefault();

        // 此處插入後端資料

        CreatRoomDom();//創建dom，需要傳入房間資訊
    });

    function CreatRoomDom(roomInfor = {
        roomId: 121212,
        type: "類型",
        status: "狀態",
        qusType: "出題類型",
        name: "房間名稱"
    }) {

        //加入html
        var roomHtml = `
        <!-- 可加入的房間 -->
        <div class="col row align-items-center room-board-con canJoinRoom">
            <div class="col-2 room-id" room-id="${roomInfor["roomId"]}">ID:${roomInfor["roomId"]}</div>
            <div class="col-3 room-name line-clamp-1">${roomInfor["name"]}</div>
            <div class="col-2 room-type">${roomInfor["type"]}</div>
            <div class="col-2 room-status">${roomInfor["status"]}</div>
            <div class="col-3 room-qus-type">${roomInfor["qusType"]}</div>
            <div class="col-2 room-people">12/30</div>
            
        </div>
        <hr style="margin: 0;">
        `;


        canJoinRoomCon.append(roomHtml);
    }
    
    document.getElementById("input-room-id").addEventListener("keydown", function (e) {
        if (e.key === "Enter" && this.value.trim() === "") {
            e.preventDefault(); // 阻止提交表單
            // 可以添加一些用戶提示，例如警告或錯誤消息
        }
    });

    document.getElementById("join").addEventListener("submit", function (e) {
        const roomInput = document.getElementById("input-room-id");
        
        // 檢查如果 roomInput 為空或僅包含空格，阻止表單提交
        if (roomInput.value.trim() === "") {
            e.preventDefault(); // 阻止提交表單
            // 可以添加一些用戶提示，例如警告或錯誤消息
        }
    });

    //----------------------判斷權限--------------------
    var accountPermissions = "teacher";//帳號權限
    // var accountPermissions = "student";

    if (accountPermissions == "student") {
        createRoom.hide();
        createRoomBoard.hide();
    }


    //-------------顯示歷史/顯示房間列表--------------------
    const playRecordListCon = $("#play-record-lsit-con");
    const replayCon = $("#replay-con");
    const roomListCon = $("#room-list-con");
    const lookHistoryBtn = $("#look-history");

    lookHistoryBtn.click(function () {
        roomListCon.slideUp(250, function () {
            replayCon.slideDown();
            playRecordListCon.slideDown();
        });

    });

    document.getElementById("log-out").addEventListener("click", function () {
        window.location.href = "/logout";
    });
    //----------------顯示頭貼---------------------
    /*const profilePhoto = $("#profile-photo");//頭貼

    ChangeProfilePhoto("./assets/img/001.jpg");
    //改變頭像，傳入URL
    function ChangeProfilePhoto(profileUrl=""){
        profilePhoto.attr("src",profileUrl);
    }*/
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}-${day}`;
    }

    //------------設置權限-----------------
    const permissionTitle = $("#permission-title");
    const manageQusBankBtn = $("#manage-qus-bank-btn");

    // SetUserPermission("學生");
    function SetUserPermission(permission) {
        if (permission == "teacehr") {
            permissionTitle.text("老師");
            manageQusBankBtn.show();
        }
        else if (permission == "student") {
            permissionTitle.text("學生");
            manageQusBankBtn.hide();
        }
    }
    const usernameElement = document.getElementById('username');
    const userLvElement = document.getElementById('userLv');
    const userroleElement = document.getElementById('permission-title');
    const roomInfoElement = document.getElementById('can-join-room-con');
    const topicElement = document.getElementById('topic');

    $.ajax({
        url: '/homeData', // 請將路由設置為返回用戶資料的路由
        type: 'GET',
        success: function (data) {
            // 在這裡處理從後端獲取的資料
            console.log('用戶資料：', data);
            const imageUrl = data.img;
            const userImage = document.getElementById('profile-photo');
            userImage.src = imageUrl;
            usernameElement.textContent = data.Name ? data.Name : 'name is unknown';
            userLvElement.textContent = data.Lv ? 'Lv.' + data.Lv : 'Lv is unknown';
            SetUserPermission(data.role)
        },
        error: function (error) {
            console.error('發生錯誤：', error);
        }
    });

    // Socket.IO 連接
    const socket = io();

    socket.on('newpublic', (newpublic) => {
        const roomStatusText = newpublic.state === 'public' ? '公共' : '私人';
        let publicTypeText = '';
        switch (newpublic.type) {
            case 'class':
                publicTypeText = '全班';
                break;
            case 'team':
                publicTypeText = '小組';
                break;
            case 'personal':
                publicTypeText = '個人';
                break;
        }
        const roomElement = document.createElement('div');
        roomElement.className = 'col row align-items-center room-board-con canJoinRoom';
        roomElement.innerHTML = `
            <div class="col-2 room-id" room-id="${newpublic.RoomCode}">ID:${newpublic.RoomCode}</div>
            <div class="col-2 room-name line-clamp-1">${newpublic.RoomName}</div>
            <div class="col-2 room-type">${publicTypeText}</div>
            <div class="col-2 room-status">${roomStatusText}</div>
            <div class="col-2 room-qus-type">${newpublic.MasterName}</div>
            <div class="col-2 room-people">${formatDate(newpublic.createdAt)}</div>
        </div>
        <hr style="margin: 0;">
        `;

        // 將 hrElement 附加到 roomElement 內部
        roomInfoElement.insertBefore(roomElement, roomInfoElement.firstChild);
        roomElement.addEventListener('click', async () => {
            try {
                const roomCode = roomElement.querySelector('.room-id').getAttribute('room-id');
                const requestData = { roomCode: roomCode };
                const requestBody = JSON.stringify(requestData);

                const response = await fetch('home/rooms/GoChat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: requestBody
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                } else
                    window.location.href = `/home/rooms/Room_${roomCode}`;
            } catch (error) {
                console.error('Fetch error:', error);
            }
        });
    });

    // 處理獲取房間信息並顯示到前端
    socket.on('viewcode', (roomInfoArray) => {
        roomInfoElement.innerHTML = ''; // 清空已有的房間信息

        roomInfoArray.forEach(room => {
            const roomElement = document.createElement('div');
            const roomStatusText = room.state === 'public' ? '公共' : '私人';
            let roomTypeText = '';
            switch (room.type) {
                case 'class':
                    roomTypeText = '全班';
                    break;
                case 'team':
                    roomTypeText = '小組';
                    break;
                case 'personal':
                    roomTypeText = '個人';
                    break;
            }
            roomElement.className = 'col row align-items-center room-board-con canJoinRoom';
            roomElement.innerHTML = `
                <div class="col-2 room-id" room-id="${room.RoomCode}">ID:${room.RoomCode}</div>
                <div class="col-2 room-name line-clamp-1">${room.RoomName}</div>
                <div class="col-2 room-type">${roomTypeText}</div>
                <div class="col-2 room-status">${roomStatusText}</div>
                <div class="col-2 room-qus-type">${room.teacehr}</div>
                <div class="col-2 room-people">${formatDate(room.LastUpdatedAt)}</div>
            </div>
            <hr style="margin: 0;">
            `;
            roomInfoElement.appendChild(roomElement);


            // 設定點擊事件，跳轉到對應房間
            roomElement.addEventListener('click', async () => {
                try {
                    const roomCode = roomElement.querySelector('.room-id').getAttribute('room-id');
                    const requestData = { roomCode: roomCode };
                    const requestBody = JSON.stringify(requestData);

                    const response = await fetch('home/rooms/GoChat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json' // 设置请求头
                        },
                        body: requestBody
                    });

                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    } else
                        window.location.href = `/home/rooms/Room_${roomCode}`;
                } catch (error) {
                    console.error('Fetch error:', error);
                }
            });
        });
    });

    socket.on('userId', (userId) => {
        console.log(userId)
    });

    // 處理 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    if (message === 'unknow') {
        window.alert('找不到房間');
        window.location.href = '/home';
    }
    if (message === 'alreadyjoined') {
        window.alert('您已經加入過這個房間了');
        window.location.href = '/home';
    }
});