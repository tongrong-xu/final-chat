$(document).ready(function(){

    //------------------控制顯示介面--------------------
    const createRoom = $("#create-room");
    const joineRoom = $("#join-room");

    const createRoomBoard = $(".create-room-con");
    const joineRoomBoard = $(".join-room-con");

    createRoom.click(function(){
        roomHistoryReplay.each(function(){
            $(this).css("background-color", "");
        });
        if(joineRoomBoard.css("display") != "none"){
            joineRoomBoard.fadeOut(200,function(){
                createRoomBoard.fadeIn();
            });
        }
        if(replayBoard.css("display") != "none"){
            replayBoard.fadeOut(200,function(){
                createRoomBoard.fadeIn();
            });
        }
    });

    joineRoom.click(function(){
        roomHistoryReplay.each(function(){
            $(this).css("background-color", "");
        });
        if(createRoomBoard.css("display") != "none"){
            createRoomBoard.fadeOut(200,function(){
                joineRoomBoard.fadeIn();
            });
        }
        if(replayBoard.css("display") != "none"){
            replayBoard.fadeOut(200,function(){
                joineRoomBoard.fadeIn();
            });
        }
        
    });


    
    //--------------------顯示遊玩紀錄--------------------

    // 查詢房間紀錄
    const replayBoard = $(".replay-information");
    var roomHistoryReplay = $(".roomHistory");

    //點擊後顯示房間詳細資訊
    roomHistoryReplay.click(function(){
        if(createRoomBoard.css("display") != "none"){
            createRoomBoard.fadeOut(200,function(){
                replayBoard.fadeIn();
            });
        }
        if(joineRoomBoard.css("display") != "none"){
            joineRoomBoard.fadeOut(200,function(){
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

        roomHistoryReplay.each(function(){
            $(this).css("background-color", "");
        });
        $(this).css("background-color","rgb(230,230,230)")

        replayBoard.find(".room-name").text(roomHistoryReplayInfor["name"]);
        replayBoard.find(".room-id").text("ID:"+ roomHistoryReplayInfor["roomId"]);
        replayBoard.find(".room-type").text(roomHistoryReplayInfor["type"]);
        replayBoard.find(".room-qus-type").text(roomHistoryReplayInfor["qusType"]);
    });


    //----------------------加入房間---------------------
    var canJoinRoom = $(".canJoinRoom");
    //加入房間
    canJoinRoom.click(function(){
        joinRoom($(this));
    });

    function joinRoom(obj){
        var roomId = obj.find(".room-id").attr("room-id");
        console.log("你加入了" + roomId + "房間");
    }


    //------------------------新增房間------------------

    const createRoomSub = $("#create-room-submit");

    createRoomSub.click(function(){

        //輸入房間資訊
        var roomInfor = {
            roomId: 121212,
            type: "類型",
            qusType: "出題類型",
            name: "房間名稱"
        };

        //加入html
        var roomHtml = `
        <!-- 可加入的房間 -->
        <div class="col row align-items-center room-board-con canJoinRoom">
            <div class="col-3 room-id" room-id="184522">ID:${roomInfor["roomId"]}</div>
            <div class="col-3 room-type">${roomInfor["type"]}</div>
            <div class="col-3 room-qus-type">${roomInfor["qusType"]}</div>
            <div class="col-3 room-people">12/30</div>
        </div>
        <hr style="margin: 0;">
        `;

        var canJoinRoomCon = $("#can-join-room-con");
        canJoinRoomCon.append(roomHtml);

        canJoinRoom.click(function(){
            joinRoom($(this));
        });
    });


    //----------------------判斷權限----------
    var accountPermissions = "teacher";//帳號權限
    // var accountPermissions = "student";

    if(accountPermissions == "student"){
        createRoom.hide();
        createRoomBoard.hide();
    }

});