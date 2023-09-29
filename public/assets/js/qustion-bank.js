$(document).ready(function () {
    //左邊題庫
    let qusBank = $(".qus-bank");

    //右邊題目
    const qustionInBank = $(".qustion-in-bank");
    const qustBankParent = $(".qustionbank-parent");

    const BankName = $(".BankName");
    const qusNumText = $(".qusion-number");

    let nowQusBankId = 1; //目前選擇的題庫id

    function removeWhiteSpace(input) {
        input.value = input.value.replace(/\s+/g, ''); // 移除所有空格和回車
    }

    //調用此函數創建題目dom
    function createQustionDom(qusIndex = 0, qusContent = {
        qustion: "預設題目",
        option1: "選項A",
        option2: "選項B",
        option3: "選項C",
        option4: "選項D",
        correct: 1,
        //此題庫內第幾個題目
        qusIndex: 3,
        createDate: "2023-09-13",
    }) {

        qusContent["qusIndex"] = qusIndex;
        let qusDom = `
        <!-- 一個問題 -->
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading${qusContent["qusIndex"]}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${qusContent["qusIndex"]}" aria-expanded="true" aria-controls="collapse${qusContent["qusIndex"]}">
              <div class="edit-qus" edit-mode="false" qusbank-id="${qusContent["qusIndex"]}" style="margin-right: 10px;">
                <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="30px" >
              </div>  
              <div class="create-date">
              第${qusContent["qusIndex"]+1}題
                ${qusContent["createDate"]}
              </div>
              <div class="qus-name">
                ${qusContent["qustion"]}
              </div>
              <input type="text" class="edit-qus-name-input" placeholder="預設名稱" style="display: none;">
              <input type="submit" class="edit-qus-name-submit" value="更改題目" style="display: none;">
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

        let qusDomUseJquery = $(qusDom);
        //加入正解變色
        qusDomUseJquery.find(".qus-btn").each(function (i) {

            if (i == (qusContent["correct"] - 1)) {
                $(this).addClass("qus-btn-correct");
                this.classList.add("qus-btn-correct");
            }
        });

        qustionInBank.append(qusDomUseJquery.get());

        //修改題目數量
        let qusNum = parseInt(qusNumText.attr("qus-num")) + 1;
        qusNumText.attr("qus-num", qusNum.toString());
        qusNumText.text("題目數量：" + qusNum);
        // 重新設定監聽
        editQusBtn = $(".edit-qus");
        editQusBtn.click(editQusBtnClick);

        return qusDomUseJquery.get();
    }

    //調用此函數創建題庫dom
    function CreateQusBankDom(qusBankId, qusBankObj = {
        id: 0,
        name: "預設題庫名稱",
        //題庫內題目數量
        qusNum: 0
    }) {
        qusBankObj["id"] = qusBankId;

        let qusBankDom = `
        <!-- 題庫 -->
        <div class="col row align-items-center qus-bank" qusbank-id="${qusBankObj["id"]}">
            <div class="col-7 line-clamp-1 qustionbank-text">${qusBankObj["name"]}</div>
            <div class="col-2 line-clamp-1 qustionbank-number">${qusBankObj["qusNum"]}題</div>
            <div class="col-3 rank d-flex justify-content-around align-items-center">
                <div class="edit-qusbank" edit-mode="false" qusbank-id="${qusBankObj["id"]}">
                <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="40px">
                </div>
            </div>
        </div>
        <hr style="margin: 0;">
        `;


        BankName.append(qusBankDom);

        //重新設定監聽
        qusBank = $(".qus-bank");
        qusBank.click(qusBankClick);
        let editQusBankBtn = $(".edit-qusbank");
        editQusBankBtn.click(editQusBankBtnClick);

        return qusBankDom;
    }

    //----------------以下為開關介面--------------------

    //控制選項
    let editQusBtn = $(".edit-qus");
    let createQusBtn = $(".create-qus");
    let qusBtn = $(".qus-btn");
    let editQusBankBtn = $(".edit-qusbank");
    let createQusBankBtn = $(".create-qusbank");
    let makeQusBtn = $("#make-qus-btn");
    let makeQusbankBtn = $("#make-qusbank-btn");
    //創建題目
    const makeQusCon = $(".make-quetion-con");
    const makeQusBack = $("#make-qus-back");
    const makeQusBg = $("#make-qus-bg");
    //創建題庫
    const makeQusBankCon = $(".make-quetionbank-con");
    const makeQusBankBack = $("#make-qusbank-back");


    //選擇題庫
    qusBank.click(qusBankClick);

    function qusBankClick() {
        //選擇同一個題庫不會重新載入
        if (nowQusBankId != $(this).attr("qusbank-id")) {
            nowQusBankId = $(this).attr("qusbank-id");

            qusBank.each(function () {
                qusBank.removeClass("qusbank-choose");
            });
            $(this).addClass("qusbank-choose");

            //讀取題庫ID
            nowQusBankId = parseInt($(this).attr("qusbank-id"));

            //重置題目
            qustionInBank.empty();
            qusIndex = 0;
        }
    }

    //開啟創建題目
    createQusBtn.click(function () {
        const bankname = document.getElementById("bankname").textContent
        if (bankname != "題庫名稱") {
            //console.log(document.getElementById("bankname").textContent)
            makeQusCon.show();
            makeQusBg.show();
        }
    });

    //編輯題目
    editQusBtn.click(editQusBtnClick);

    function editQusBtnClick() {
        //取得題庫id
        let qusBankId = $(this).attr("qusbank-id");
        //取得題目id
        let qusId = $(this).attr("qus-index");
        //console.log(qusBankId + "   " + qusId)
        makeQusCon.attr("mode", "create");
        makeQusBtn.val("編輯題目");
        makeQusCon.attr("mode", "edit");
        makeQusCon.show();
        makeQusBg.show();
    }

    //編輯題庫視窗
    editQusBankBtn.click(editQusBankBtnClick);

    function editQusBankBtnClick() {
        //取得題庫id
        let qusBankId = $(this).attr("qusbank-id");
        makeQusBankCon.show();
        makeQusBg.show();
        makeQusBankCon.attr("mode", "edit");
        makeQusBankCon.attr("editQusBankId", qusBankId);
        makeQusbankBtn.val("編輯題庫");
    }


    //關閉創建題目
    makeQusBack.click(function (event) {
        if (makeQusCon.attr("mode") == "create") {
            event.preventDefault();
            makeQusCon.hide();
            makeQusBg.hide();
        }
        //如果是編輯題目，關閉時重置回創建
        else if (makeQusCon.attr("mode") == "edit") {
            makeQusCon.attr("mode", "create");
            makeQusBtn.val("創建題目");
            event.preventDefault();
            makeQusCon.hide();
            makeQusBg.hide();
        }
    });

    //開啟創建題庫
    createQusBankBtn.click(function () {
        makeQusBankCon.show();
        makeQusBg.show();
    });

    //關閉創建題庫
    makeQusBankBack.click(function (event) {
        if (makeQusBankCon.attr("mode") == "create") {
            event.preventDefault();
            makeQusBankCon.hide();
            makeQusBg.hide();
        }
        //如果是編輯題庫，關閉時重置回創建
        else if (makeQusBankCon.attr("mode") == "edit") {
            makeQusBankCon.attr("mode", "create");
            makeQusBankCon.attr("editQusBankId", "0");
            makeQusbankBtn.val("創建題庫");
            event.preventDefault();
            makeQusBankCon.hide();
            makeQusBg.hide();
        }

    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    //---------以下避免表單送出時跳轉------------------

    $.ajax({
        url: '/home/rooms/QSbankData',
        type: 'GET',
        success: function (data) {
            data.qsname.forEach((qusItem, index) => {
                //console.log(qusItem.topic)
                CreateQusBankDom(index, {
                    id: index,
                    name: qusItem.Itemname,
                    qusNum: qusItem.topic.length
                });
            });
        }
    });

    BankName.on("click", ".qus-bank", function () {
        qusBankClick()
        // 獲取被點擊的 .qus-bank 元素的 qusbank-id
        const qusBankId = $(this).attr("qusbank-id");
        // 使用 find 方法獲取包含題庫名稱的元素，然後獲取其文本內容
        const qusBankname = $(this).find('.qustionbank-text').text();

        document.getElementById("bankname").textContent = qusBankname;

        let sendData = {
            data: qusBankname
        };
        if (qusBankname) {
            $.ajax({
                url: '/home/rooms/Questiontopic',
                type: 'POST',
                data: JSON.stringify(sendData),
                contentType: 'application/json',
                success: function (data) {
                    document.getElementById("bankamount").textContent = "題目數量：" + data.topicview.length;
                    data.topicview.forEach((qusItem, index) => {
                        createQustionDom(index, {
                            qustion: qusItem.topic,
                            option1: qusItem.ans[0],
                            option2: qusItem.ans[1],
                            option3: qusItem.ans[2],
                            option4: qusItem.ans[3],
                            correct: qusItem.correctOption,
                            qusIndex: index,
                            createDate: formatDate(qusItem.createdAt),
                        });
                    });
                    //console.log(data);
                },
                error: function (XMLHttpRequest, textStatus) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                }
            });
        }
        //console.log('qusBankId', qusBankId, 'qusBankname', qusBankname);
    });

    // 使用事件委托監聽點擊事件
    BankName.on("click", ".edit-qusbank", function () {
        // 獲取點擊的編輯按鈕所在的題庫id
        const qusBankId = $(this).attr("qusbank-id");

        // 找到包含題庫名稱的元素，然後獲取其文本內容
        const qusBankName = $(this).closest(".qus-bank").find('.qustionbank-text').text();

        $('#origindata').val(qusBankName);

        // 獲取輸入框元素
        const quesbankInput = $("#quesbank-input");

        // 更改輸入框的 placeholder
        quesbankInput.attr("placeholder", `請輸入題庫名稱 (${qusBankName})`);

    });


    makeQusbankBtn.click(function (event) {
        // action為空白，並在這裡把表單傳入後端
        event.preventDefault();
        let quesbankinput = document.getElementById("quesbank-input").value;
        if (makeQusbankBtn.val() == "創建題庫") {
            $.ajax({
                url: '/home/rooms/QuestionBankName',
                type: 'POST',
                data: {
                    data: quesbankinput
                },
                success: function (data) {
                    BankName.empty()
                    //console.log('Success:', data);
                    makeQusBankCon.hide();
                    makeQusBg.hide();
                    document.getElementById("quesbank-input").value = ""
                    document.getElementById("bankname").textContent = item.Itemname
                    //console.log(data)
                    data.qsname.forEach((qusItem, index) => {
                        CreateQusBankDom(index, {
                            id: index,
                            name: qusItem.Itemname,
                            qusNum: qusItem.topic.length
                        });
                    });
                },
                error: function (xhr) {
                    if (xhr.status === 400) {
                        alert('題庫名稱已存在，請選擇一個不同的名稱。');
                    }
                }
            })
        } else if (makeQusbankBtn.val() == "編輯題庫") {
            const origindata = document.getElementById("origindata").value
            $.ajax({
                url: '/home/rooms/BankNameUpdata',
                type: 'POST',
                data: {
                    origindata: origindata,
                    newdata: quesbankinput
                },
                success: function (data) {
                    document.getElementById("origindata").value = document.getElementById("quesbank-input").value
                    BankName.empty()
                    console.log('Success:', data);
                    makeQusBankCon.hide();
                    makeQusBg.hide();
                    document.getElementById("quesbank-input").value = ""
                    document.getElementById("bankname").textContent = document.getElementById("origindata").value
                    data.qsname.forEach((qusItem, index) => {
                        //console.log(qusItem.topic)
                        CreateQusBankDom(index, {
                            id: index,
                            name: qusItem.Itemname,
                            qusNum: qusItem.topic.length
                        });
                    });
                },
                error: function (xhr) {
                    if (xhr.status === 400) {
                        alert('題庫名稱已存在，請選擇一個不同的名稱。');
                    }
                }
            })
        }
    });

    makeQusBtn.click(function (event) {
        // action為空白，並在這裡這裡把表單傳入後端
        const bankname = document.getElementById("bankname").textContent
        if (bankname != "題庫名稱") {
            event.preventDefault();
            //console.log(bankname)
            let formData = {
                questiontextarea: $('#question-textarea').val(),
                extradata: bankname,
                qusopation: $('input[name=qus-opation]:checked').val(),
                opationname1: $('#opation-name-1').val(),
                opationname2: $('#opation-name-2').val(),
                opationname3: $('#opation-name-3').val(),
                opationname4: $('#opation-name-4').val()
            };

            $.ajax({
                url: '/home/rooms/QuestionBanktopic',
                type: 'POST',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                success: function (data) {
                    document.getElementById("bankamount").textContent = "題目數量：" + data.topicview.length;
                    qustionInBank.empty();
                    makeQusCon.hide();
                    makeQusBg.hide();
                    const findBanknum = BankName.find(".qustionbank-text");
                    $('#question-textarea').val('');
                    $('#opation-name-1').val('');
                    $('#opation-name-2').val('');
                    $('#opation-name-3').val('');
                    $('#opation-name-4').val('');
                    $('input[name=qus-opation]:checked').prop('checked', false);
                    $('input[name=qus-opation]:checked').val('');
                    data.topicview.forEach((qusItem, index) => {
                        createQustionDom(index, {
                            qustion: qusItem.topic,
                            option1: qusItem.ans[0],
                            option2: qusItem.ans[1],
                            option3: qusItem.ans[2],
                            option4: qusItem.ans[3],
                            correct: qusItem.correctOption,
                            qusIndex: index,
                            createDate: formatDate(qusItem.createdAt),
                        });
                    });
                    findBanknum.each(function () {
                        if ($(this).text() === bankname) {
                            const qustionbankNumber = $(this).closest(".qus-bank").find(".qustionbank-number");
                            qustionbankNumber.text(data.topicview.length + "題");
                        }
                    });
                },
                error: function (XMLHttpRequest, textStatus) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                }
            });

        }
    });

    //-------------以下為自動創建--------------------

    //自動創建題目dom
    /*var qusIndex = 1;
    setInterval(function () {
        createQustionDom(qusIndex);
        qusIndex++;
    }, 10000);

    //自動創建題庫dom
    var qusBankIndex = 0;
    setInterval(function () {
        CreateQusBankDom(qusBankIndex);
        qusBankIndex++;
    }, 10000);*/
});