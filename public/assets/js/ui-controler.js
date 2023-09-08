$(document).ready(function(){

    //------------UI摺疊---------------------
    const left = {
        open: true,
        dom: $(".left-con"),
        arrow: $("#left-arrow")
    };
    const right = {
        open: true,
        dom: $(".right-con"),
        arrow: $("#right-arrow")
    };
    const qus = {
        open: true,
        dom: $(".qus-con")
    };
    const down = {
        open: false,
        dom: $(".down-con"),
        arrow: $("#down-arrow")
    };
    const input = {
        open: true,
        dom: $(".input-message-con")
    };


    left["dom"].click(function(event){
        if ($(event.target).is("#left-put-away")) {
            if(left["open"] == true)
            {
                left["open"] = false;
                left["dom"].animate({
                    left: "-18.4vw"
                },400);
                left["arrow"].css("transform", "rotate(0deg)");
            }
            else
            {
                left["open"] = true;
                left["dom"].animate({
                    left: "0vw"
                },400);
                left["arrow"].css("transform", "rotate(180deg)");
            }
        }
        
    });

    right["dom"].click(function(event){
        if ($(event.target).is("#right-put-away")) {
            if(right["open"] == true)
            {
                right["open"] = false;
                right["dom"].animate({
                    right: "-22.5vw"
                },400);
                console.log(right["arrow"].get(0));
                right["arrow"].css("transform", "rotate(180deg)");
            }
            else
            {
                right["open"] = true;
                right["dom"].animate({
                    right: "0vw"
                },400);
                right["arrow"].css("transform", "rotate(0deg)");
            }
        }

        
    });

    down["dom"].click(function(event){
        if ($(event.target).is("#down-put-away")) {
            if(down["open"] == true)
            {
                down["open"] = false;
                down["dom"].animate({
                    bottom: "-=22.5vh"
                },400);

                right["dom"].animate({
                    height: "+=22.5vh"
                },400);
                left["dom"].animate({
                    height: "+=22.5vh"
                },400);
                
                qus["dom"].animate({
                    bottom: "-=22.5vh"
                },400);
                input["dom"].animate({
                    bottom: "-=22.5vh"
                },400);
                down["arrow"].css("transform", "rotate(270deg)");
            }
            else
            {
                down["open"] = true;
                down["dom"].animate({
                    bottom: "+=22.5vh"
                },400);

                right["dom"].animate({
                    height: "-=22.5vh"
                },400);
                left["dom"].animate({
                    height: "-=22.5vh"
                },400);

                qus["dom"].animate({
                    bottom: "+=22.5vh"
                },400);
                input["dom"].animate({
                    bottom: "+=22.5vh"
                },400);
                down["arrow"].css("transform", "rotate(90deg)");
            }
        }
        
    });
    //-------------------------以上為UI折疊--------------------------


    //-----------------------設定--------------------
    const settingCon = $(".setting-con");
    const settingOpenBtn = $("#setting-open-btn")
    const backToGame = $("#back-to-game");
    const leaveRoom = $("#leave-room");

    settingOpenBtn.click(function(){
        settingCon.show();
    });

    backToGame.click(function(){
        settingCon.hide();
    })

    leaveRoom.click(function(){
        console.log("你離開房間了");
    });
});