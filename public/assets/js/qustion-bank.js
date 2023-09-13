$(document).ready(function(){
    //左邊題庫
    let qusBank = $(".qus-bank");

    //右邊題目
    const qustionInBank = $(".qustion-in-bank");
    const qustBankParent = $(".qustionbank-parent");
    const qusNumText = $(".qusion-number");


    var nowQusBankId =0;//目前選擇的題庫id

    //選擇題庫
    qusBank.click(function(){
        qusBank.each(function(){
            qusBank.removeClass("qusbank-choose");
        });
        $(this).addClass("qusbank-choose");

        //讀取題庫ID
        nowQusBankId = parseInt($(this).attr("qusbank-id"));

        //重置題目
        qustionInBank.empty();
        qusIndex = 0;
    });



    //------------------以下自動創建---------------


    //自動創建題目dom
    // var qusIndex = 1;
    // setInterval(function(){
    //     qustionInBank.append(createQustionDom(qusIndex));

    //     let qusNum = parseInt(qusNumText.attr("qus-num"))+1;
    //     qusNumText.attr("qus-num",qusNum.toString());
    //     qusNumText.text("題目數量："+ qusNum);

    //     qusIndex++;
    // }, 3000);

    //自動創建題庫dom
    // var qusBankIndex = 0;
    // setInterval(function(){
    //     qustBankParent.append(CreateQusBankDom(qusBankIndex));


    //     //重新設定監聽
    //     qusBank = $(".qus-bank");
    //     qusBank.click(function(){
    //         qusBank.each(function(){
    //             qusBank.removeClass("qusbank-choose");
    //         });
    //         $(this).addClass("qusbank-choose");

    //         //讀取題庫ID
    //         nowQusBankId = parseInt($(this).attr("qusbank-id"));

    //         //重置題目
    //         qustionInBank.empty();
    //         qusIndex = 0;
    //     });

    //     qusBankIndex++;
    // }, 3000);


    //--------------------以上自動創建-------------


    //調用此函數創建題目dom
    function createQustionDom(qusIndex = 0){
        let qusContent = {
            qustion:"預設題目",
            option1:"選項A",
            option2:"選項B",
            option3:"選項C",
            option4:"選項D",
            correct:1,
            //此題庫內第幾個題目
            qusIndex:3,
            createDate:"2023-09-13"
        }

        qusContent["qusIndex"]=qusIndex

        let qusDom =`
        <!-- 一個問題 -->
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading${qusContent["qusIndex"]}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${qusContent["qusIndex"]}" aria-expanded="true" aria-controls="collapse${qusContent["qusIndex"]}">
                ${qusContent["qustion"]}${qusContent["qusIndex"]+1}
            </button>
            </h2>
            <div id="collapse${qusContent["qusIndex"]}" class="accordion-collapse collapse" aria-labelledby="heading${qusContent["qusIndex"]}" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <div class="row">
                <div class="qus-btn col">${qusContent["option1"]}</div>
                <div class="qus-btn col">${qusContent["option2"]}</div>
                <div class="qus-btn col">${qusContent["option3"]}</div>
                <div class="qus-btn col">${qusContent["option4"]}</div>
                </div>
            </div>
            </div>
        </div>
        `;

        //加入正解變色
        $(qusDom).find(".qus-btn").each(function(i){
            if(i == (qusContent["correct"]-1)){
                $(this).addClass("qus-btn-correct");
                // console.log($(this).get())
            }
        });

        return qusDom;
    }
    
    //創建題庫dom
    function CreateQusBankDom(qusBankId){
        let qusBankObj = {
            id:0,
            name:"預設題庫名稱",
            qusNum:0 //題庫內題目數量
        };
        qusBankObj["id"]=qusBankId;

        let qusBankDom = `
        <!-- 題庫 -->
        <div class="col row align-items-center qus-bank" qusbank-id="${qusBankObj["id"]}">
            <div class="col-9 line-clamp-1 qustionbank-text">${qusBankObj["name"]}${qusBankObj["id"]}</div>
            <div class="col-3 rank">編輯</div>
        </div>
        <hr style="margin: 0;">
        `;

        // console.log(qusBankDom)

        return qusBankDom;
    }


    //控制選項
    const editQusBtn = $(".edit-qus");
    const createQusBtn = $(".create-qus");
    let editClassName = $(".edit-qus-name-input");
    let editClassNameSub = $(".edit-qus-name-submit");

    //編輯題目
    editQusBtn.click(function(){
        let editMode = editQusBtn.attr("edit-mode");
        console.log(editMode)
        if(editMode == "false"){
            editQusBtn.attr("edit-mode","true");
            editQusBtn.children(".edit-true").hide();
            editQusBtn.children(".edit-false").show();
            editClassName.show();
            editClassNameSub.show();
            
        }else{
            editQusBtn.attr("edit-mode","false");
            editQusBtn.children(".edit-true").show();
            editQusBtn.children(".edit-false").hide();
            editClassName.hide();
            editClassNameSub.hide();
        }
    });

    //更改題目名稱
    editClassNameSub.click(function(){
        let newName = $(this).siblings(".edit-qus-name-input").val();
        $(this).siblings(".qus-name").text(newName);
    });

    createQusBtn.click(function(){
        
    });


});