$(document).ready(function(){
    var studentDiv = $(".student-login");
    var teacherDiv = $(".teacher-login");
    var bg = $(".bg");
    var nowChoose = 0;//0無選擇1學生2教師

    studentDiv.click(function(){
        if(nowChoose != 1){
            nowChoose=1;

            teacherDiv.find(".content > .information > .introduce").fadeOut(100);
            teacherDiv.find(".content > .information > .avater").fadeOut(50,function(){
                setTimeout(function(){
                    teacherDiv.find(".content > .information > .avater").fadeIn(300);
                },100);
            });
    
            teacherDiv.find(".content").css("padding","30px");
            studentDiv.find(".content > .information > .introduce").fadeIn();
            // studentDiv.find(".content > .information > .avater").fadeOut(50,function(){
            //     setTimeout(function(){
            //         studentDiv.find(".content > .information > .avater").fadeIn(300);
            //     },100);
            // });
    
            teacherDiv.find(".content > .log-in-form").fadeOut(150);
            studentDiv.find(".content > .log-in-form").fadeIn();
    
            studentDiv.addClass("zoom-in");
            studentDiv.removeClass("zoom-out");
    
            teacherDiv.addClass("zoom-out");
            teacherDiv.removeClass("zoom-in");
        }
    });

    teacherDiv.click(function(){
        if(nowChoose != 2){
            nowChoose = 2;
            studentDiv.find(".content > .information > .introduce").fadeOut(100);
            studentDiv.find(".content > .information > .avater").fadeOut(50,function(){
                setTimeout(function(){
                    studentDiv.find(".content > .information > .avater").fadeIn(300);
                },100);
            });
    
            studentDiv.find(".content").css("padding","30px");
            teacherDiv.find(".content > .information > .introduce").fadeIn();
            // teacherDiv.find(".content > .information > .avater").fadeOut(50,function(){
            //     setTimeout(function(){
            //         teacherDiv.find(".content > .information > .avater").fadeIn(300);
            //     },100);
            // });
    
            teacherDiv.find(".content > .log-in-form").fadeIn();
            studentDiv.find(".content > .log-in-form").fadeOut(150);
    
            studentDiv.addClass("zoom-out");
            studentDiv.removeClass("zoom-in");
            
            teacherDiv.addClass("zoom-in");
            teacherDiv.removeClass("zoom-out");
        }
    });

    bg.click(function(){
        if(nowChoose != 0){
            nowChoose = 0;

            teacherDiv.find(".content > .information > .introduce").fadeIn();
            studentDiv.find(".content > .information > .introduce").fadeIn();
            teacherDiv.find(".content").css("padding","70px 50px");
            studentDiv.find(".content").css("padding","70px 50px");
    
            teacherDiv.find(".content > .log-in-form").fadeOut(100);
            studentDiv.find(".content > .log-in-form").fadeOut(100);
    
            studentDiv.removeClass("zoom-in");
            studentDiv.removeClass("zoom-out");
    
            teacherDiv.removeClass("zoom-out");
            teacherDiv.removeClass("zoom-in");
        }
    });

    const logInHomeTab = $("#log-in-home-tab-active");
    const signUpProfileTab = $("#sign-up-profile-tab-non");
    const logInHomeTab2 = $("#log-in-home-tab2-active");
    const signUpProfileTab2 = $("#sign-up-profile-tab2-non");

    signUpProfileTab.click(function(){
        logInHomeTab.attr("id","log-in-home-tab-non");
        signUpProfileTab.attr("id","sign-up-profile-tab-active");
    });

    logInHomeTab.click(function(){
        logInHomeTab.attr("id","log-in-home-tab-active");
        signUpProfileTab.attr("id","sign-up-profile-tab-non");
    });

    signUpProfileTab2.click(function(){
        logInHomeTab2.attr("id","log-in-home-tab2-non");
        signUpProfileTab2.attr("id","sign-up-profile-tab2-active");
    });

    logInHomeTab2.click(function(){
        logInHomeTab2.attr("id","log-in-home-tab2-active");
        signUpProfileTab2.attr("id","sign-up-profile-tab2-non");
    });




    //註冊頁面預覽頭貼
    const fileInputStu = $("#inputFile-student");
    const thumbnailStu = $("#thumbnail-student");
    const fileInputTeacher = $("#inputFile-teacher");
    const thumbnailTeacher = $("#thumbnail-teacher");

    //判斷input是否有選擇檔案
    fileInputStu.change(function(event) {
        const file = event.target.files[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                thumbnailStu.attr("src", event.target.result);
                thumbnailStu.css("visibility", "visible");
            };
            reader.readAsDataURL(file);
        }else{
            alert("請選擇圖片文件");
            fileInputStu.val(""); 
            thumbnailStu.attr("src", "");
        }
    });
    //判斷input是否有選擇檔案
    fileInputTeacher.change(function(event) {
        const file = event.target.files[0];

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                thumbnailTeacher.attr("src", event.target.result);
                thumbnailTeacher.css("visibility", "visible");
            };
            reader.readAsDataURL(file);
        }else{
            alert("請選擇圖片文件");
            fileInputTeacher.val(""); 
            thumbnailTeacher.attr("src", "");
        }
    });

   
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    if (message === 'Email already') {
        window.alert("重複註冊");
        window.location.href = "/";
    } else if (message === 'Email pass') {
        window.alert("通過註冊");
        window.location.href = "/";
    } else if (message === 'Email NG') {
        window.alert("登入錯誤");
        window.location.href = "/";
    } else if (message === 'password error') {
        window.alert("密碼不符");
        window.location.href = "/";
    } 
});