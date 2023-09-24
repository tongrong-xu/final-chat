$(document).ready(function () {
    //左邊題庫
    let qusBank = $(".qus-bank");

    //右邊題目
    const qustionInBank = $(".qustion-in-bank");
    const qustBankParent = $(".qustionbank-parent");
    const qusNumText = $(".qusion-number");


    let nowQusBankId = 1; //目前選擇的題庫id




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
                ${qusContent["createDate"]}
              </div>
              <div class="qus-name">
                ${qusContent["qustion"]}${qusContent["qusIndex"]+1}
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
            <div class="col-7 line-clamp-1 qustionbank-text">${qusBankObj["name"]}${qusBankObj["id"]}</div>
            <div class="col-2 line-clamp-1 qustionbank-number">${qusBankObj["qusNum"]}題</div>
            <div class="col-3 rank d-flex justify-content-around align-items-center">
                <div class="edit-qusbank" edit-mode="false" qusbank-id="${qusBankObj["id"]}">
                <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="40px">
                </div>
            </div>
        </div>
        <hr style="margin: 0;">
        `;


        qustBankParent.append(qusBankDom);

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

    function escapeHtml(text) {
        if (typeof text !== 'undefined') {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return text.replace(/[&<>"']/g, (match) => map[match]);
        }
        return '';
    }

    function removeWhiteSpace(input) {
        input.value = input.value.replace(/\s/g, ''); // 移除所有空格字符
    }
    //開啟創建題目
    createQusBtn.click(function () {
        console.log(document.getElementById("bankname").textContent)
        if (document.getElementById("bankname").textContent != "題庫名稱") {
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
        console.log(qusBankId + "   " + qusId)
        makeQusCon.attr("mode", "create");
        makeQusBtn.val("編輯題目");
        makeQusCon.attr("mode", "edit");
        makeQusCon.show();
        makeQusBg.show();
    }

    //編輯題庫視窗
    //editQusBankBtn.click(editQusBankBtnClick);

    function editQusBankBtnClick() {
        //取得題庫id
        let qusBankId = $(this).attr("qusbank-id");
        makeQusBankCon.show();
        makeQusBg.show();
        makeQusBankCon.attr("mode", "edit");
        makeQusBankCon.attr("editQusBankId", qusBankId);
        makeQusbankBtn.val("編輯題庫");
    }

    function formatDate(isoDateString) {
        const date = new Date(isoDateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
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
    createQusBankBtn.click(function (event) {
        let quesbankinput = document.getElementById("quesbank-input");
        quesbankinput.placeholder = "請輸入題庫名稱";
        makeQusBankCon.show();
        makeQusBg.show();
    });

    //關閉創建題庫
    makeQusBankBack.click(function (event) {
        if (makeQusBankCon.attr("mode") == "create") {
            document.getElementById("quesbank-input").value = ""
            event.preventDefault();
            makeQusBankCon.hide();
            makeQusBg.hide();
        }
        //如果是編輯題庫，關閉時重置回創建
        else if (makeQusBankCon.attr("mode") == "edit") {
            document.getElementById("quesbank-input").value = ""
            makeQusBankCon.attr("mode", "create");
            makeQusBankCon.attr("editQusBankId", "0");
            makeQusbankBtn.val("創建題庫");
            event.preventDefault();
            makeQusBankCon.hide();
            makeQusBg.hide();
        }

    });
    const qustionbank = document.getElementById('SQB');
    const accordionExample = document.getElementById('accordionExample');
    //---------以下避免表單送出時跳轉------------------
    makeQusbankBtn.click(function (event) {
        // action為空白，並在這裡把表單傳入後端
        event.preventDefault();
        let quesbankinput = document.getElementById("quesbank-input").value;
        if (quesbankinput.includes(' ') || quesbankinput.includes('\n')) {
            alert('輸入中包含空格或回車，請重新輸入。');
        } else {
            let sendData = {
                data: quesbankinput
            }
            makeQusBankCon.hide();
            makeQusBg.hide();
            $.ajax({
                url: '/home/rooms/QuestionBankName',
                type: 'POST',
                data: sendData,
                success: function (data) {
                    document.getElementById("quesbank-input").value = ""
                    const newDiv = document.createElement('div');
                    quesbankinput = '';
                    newDiv.className = 'col row align-items-center qus-bank';
                    // 設置自訂屬性以供後續使用
                    newDiv.setAttribute('qusbank-id', banknum + 1);
                    // 創建內部HTML內容
                    newDiv.innerHTML = `
                  <div class="col-7 line-clamp-1 qustionbank-text">${escapeHtml(data.Question.Itemname)}</div>
                  <div class="col-2 line-clamp-1 qustionbank-number">${data.Question.topic.length}題</div>
                  <div class="col-3 rank d-flex justify-content-around align-items-center">
                    <div class="edit-qusbank" edit-mode="false" qusbank-id="${banknum + 1}">
                      <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="40px">
                    </div>
                  </div>
                  <hr style="margin: 0;">
                `;
                    // 將新的<div>元素添加到容器中
                    qustionbank.appendChild(newDiv);
                    newDiv.addEventListener('click', async () => {
                        try {
                            const qusBankElements = document.querySelectorAll('.qus-bank');
                            qusBankElements.forEach((element) => {
                                element.classList.remove('qusbank-choose');
                            });
                            newDiv.classList.add("qusbank-choose");
                            document.getElementById("bankname").textContent = item.Itemname;
                            document.getElementById("bankamount").textContent = "題目數量：" + item.topic.length;
                        } catch (error) {
                            console.error('ajax error in input topic:', error.message);
                        }
                    });
                    const editQusbank = newDiv.querySelector('.edit-qusbank');
                    editQusbank.addEventListener('click', async () => {
                        try {
                            const clickedItemName = data.Question.Itemname;
                            console.log(clickedItemName);
                            let qusBankId = $(this).attr("qusbank-id");
                            makeQusBankCon.show();
                            makeQusBg.show();
                            makeQusBankCon.attr("mode", "edit");
                            makeQusBankCon.attr("editQusBankId", qusBankId);
                            makeQusbankBtn.val("編輯題庫");
                            $('#make-qusbank-btn').off('click').on('click', function (event) {
                                try {
                                    event.preventDefault();
                                    let updata = document.getElementById("quesbank-input").value;
                                    if (updata.includes(' ') || updata.includes('\n')) {
                                        alert('輸入中包含空格或回車，請重新輸入。');
                                    } else {
                                        let sendData = {
                                            origin: clickedItemName,
                                            data: updata
                                        };
                                        console.log('updata !', updata);
                                        $.ajax({
                                            url: '/home/rooms/BankNameUpdata',
                                            type: 'POST',
                                            data: JSON.stringify(sendData),
                                            contentType: 'application/json',
                                            success: function (data) {
                                                console.log('Success:', data);
                                                const textElement = newDiv.querySelector('.qustionbank-text');
                                                textElement.textContent = escapeHtml(updata);
                                                makeQusBankCon.hide();
                                                makeQusBg.hide();
                                                document.getElementById("quesbank-input").value = ""
                                                document.getElementById("bankname").textContent = item.Itemname;
                                            },
                                            error: function (XMLHttpRequest, textStatus) {
                                                console.log(XMLHttpRequest)
                                                console.log(textStatus)
                                            }
                                        })
                                    }
                                    console.log('click !', clickedItemName)
                                } catch (e) {
                                    console.error(e);
                                }
                            });

                        } catch (error) {
                            console.error('ajax error in input topic:', error.message);
                        }
                    })
                },
                error: function (XMLHttpRequest, textStatus) {
                    console.log(XMLHttpRequest)
                    console.log(textStatus)
                }
            })
        }
    });
    let banknum = 0
    let topicnum = 0
    makeQusBtn.click(function (event) {
        // action為空白，並在這裡這裡把表單傳入後端
        event.preventDefault();
        const bankname = document.getElementById("bankname").textContent
        console.log('bankname', bankname)
        if (bankname != "題庫名稱") {
            const questiontextarea = document.getElementById('question-textarea').value;
            const qusopation = document.querySelector('input[name="qus-opation"]:checked').value;
            const opationname1 = document.getElementById('opation-name-1').value;
            const opationname2 = document.getElementById('opation-name-2').value;
            const opationname3 = document.getElementById('opation-name-3').value;
            const opationname4 = document.getElementById('opation-name-4').value;
            let sendData = {
                questiontextarea: questiontextarea,
                extradata: bankname,
                qusopation: qusopation,
                opationname1: opationname1,
                opationname2: opationname2,
                opationname3: opationname3,
                opationname4: opationname4
            }
            //console.log('sendData', sendData)
            $.ajax({
                url: '/home/rooms/QuestionBanktopic',
                type: 'POST',
                data: sendData,
                success: function (data) {
                    const view = data.TopicC
                    console.log('view', view)
                    const formattedDate = formatDate(view.createdAt);
                    const questionDom = `
                     <div class="accordion-item">
                     <h2 class="accordion-header" id="heading${topicnum+1}">
                       <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${topicnum}"
                       aria-expanded="false" aria-controls="collapseThree">
                         <div class="edit-qus" edit-mode="false" qusbank-id="1" qus-index="1" style="margin-right: 10px;">
                           <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="30px">
                         </div>
                         <!-- <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="30px" style="margin-right: 10px;"> -->
                         <div class="create-date">
                         ${formattedDate}
                         </div>
                         <div class="qus-name">
                         ${escapeHtml(view.topic)}
                         </div>
                       </button>
                     </h2>
                     <div id="collapse${topicnum+1}" class="accordion-collapse collapse show" aria-labelledby="heading${topicnum}"
                       data-bs-parent="#accordionExample">
                       <div class="accordion-body">
                       <div class="row">
                       ${view.ans.map((option, optionIndex) => `
                           <div class="qus-btn col ${optionIndex + 1 === view.correctOption ? 'qus-btn-correct' : ''}">
                           ${escapeHtml(option)}
                           </div>
                       `).join('')}
                   </div>
                       </div>
                     </div>
                   </div>
                     `
                    accordionExample.innerHTML += questionDom;

                    makeQusCon.hide();
                    makeQusBg.hide();
                    document.getElementById("question-textarea").value = ""
                    document.querySelector('input[name="qus-opation"]:checked').value = ""
                    document.getElementById("opation-name-1").value = ""
                    document.getElementById("opation-name-2").value = ""
                    document.getElementById("opation-name-3").value = ""
                    document.getElementById("opation-name-4").value = ""
                    var radioButtons = document.querySelectorAll(".qus-opation");
                    radioButtons.forEach(function (radioButton) {
                        radioButton.checked = false;
                    });
                },
                error: function (XMLHttpRequest, textStatus) {
                    console.log(XMLHttpRequest)
                    console.log(textStatus)
                }
            })
        }
    });
    $.ajax({
        url: '/home/rooms/QSbankData',
        type: 'GET',
        success: function (data) {
            console.log('用戶資料：', data.qsname);
            accordionExample.innerHTML = ""
            qustionbank.innerHTML = ''; // 清空容器

            data.qsname.forEach(function (item, index) {
                // 創建新的<div>元素
                const newDiv = document.createElement('div');
                newDiv.className = 'col row align-items-center qus-bank';
                // 設置自訂屬性以供後續使用
                newDiv.setAttribute('qusbank-id', index + 1);
                banknum = index + 1
                // 創建內部HTML內容
                newDiv.innerHTML = `
                  <div class="col-7 line-clamp-1 qustionbank-text">${escapeHtml(item.Itemname)}</div>
                  <div class="col-2 line-clamp-1 qustionbank-number">${item.topic.length}題</div>
                  <div class="col-3 rank d-flex justify-content-around align-items-center">
                    <div class="edit-qusbank" edit-mode="false" qusbank-id="${index + 1}">
                      <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="40px">
                    </div>
                  </div>
                  <hr style="margin: 0;">
                `;
                // 將新的<div>元素添加到容器中
                qustionbank.appendChild(newDiv);
                newDiv.addEventListener('click', async () => {
                    try {
                        const qusBankElements = document.querySelectorAll('.qus-bank');
                        qusBankElements.forEach((element) => {
                            element.classList.remove('qusbank-choose');
                        });
                        newDiv.classList.add("qusbank-choose");
                        document.getElementById("bankname").textContent = item.Itemname;
                        document.getElementById("bankamount").textContent = "題目數量：" + item.topic.length;
                        let sendData = {
                            data: item.Itemname
                        };
                        $.ajax({
                            url: '/home/rooms/Questiontopic',
                            type: 'POST',
                            data: JSON.stringify(sendData),
                            contentType: 'application/json',
                            success: function (data) {
                                accordionExample.innerHTML = ""
                                data.topicview.forEach((question, index) => {
                                    topicnum = index + 1
                                    const formattedDate = formatDate(question.createdAt);
                                    const questionDom = `
                                    <div class="accordion-item">
                                    <h2 class="accordion-header" id="heading${index + 1}">
                                      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}"
                                      aria-expanded="false" aria-controls="collapseThree">
                                        <div class="edit-qus" edit-mode="false" qusbank-id="1" qus-index="1" style="margin-right: 10px;">
                                          <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="30px">
                                        </div>
                                        <!-- <img class="edit-true" src="./assets/icon/edit_FILL0_wght400_GRAD0_opsz48.svg" alt="" width="30px" style="margin-right: 10px;"> -->
                                        <div class="create-date">
                                        ${formattedDate}
                                        </div>
                                        <div class="qus-name">
                                        ${escapeHtml(question.topic)}
                                        </div>
                                      </button>
                                    </h2>
                                    <div id="collapse${index + 1}" class="accordion-collapse collapse show" aria-labelledby="heading${index}"
                                      data-bs-parent="#accordionExample">
                                      <div class="accordion-body">
                                      <div class="row">
                                      ${question.ans.map((option, optionIndex) => `
                                          <div class="qus-btn col ${optionIndex + 1 === question.correctOption ? 'qus-btn-correct' : ''}">
                                          ${escapeHtml(option)}
                                          </div>
                                      `).join('')}
                                  </div>
                                      </div>
                                    </div>
                                  </div>
                                    `
                                    accordionExample.innerHTML += questionDom;
                                });
                            },
                            error: function (XMLHttpRequest, textStatus) {
                                console.log(XMLHttpRequest)
                                console.log(textStatus)
                            }
                        })


                    } catch (error) {
                        console.error('ajax error in input topic:', error.message);
                    }
                });
                const editQusbank = newDiv.querySelector('.edit-qusbank');
                editQusbank.addEventListener('click', async () => {
                    try {
                        const clickedItemName = item.Itemname;
                        console.log(clickedItemName);
                        let qusBankId = $(this).attr("qusbank-id");
                        makeQusBankCon.show();
                        makeQusBg.show();
                        makeQusBankCon.attr("mode", "edit");
                        makeQusBankCon.attr("editQusBankId", qusBankId);
                        makeQusbankBtn.val("編輯題庫");

                        $('#make-qusbank-btn').off('click').on('click', function (event) {
                            try {
                                event.preventDefault();
                                let updata = document.getElementById("quesbank-input").value;
                                if (updata.includes(' ') || updata.includes('\n')) {
                                    alert('輸入中包含空格或回車，請重新輸入。');
                                } else {
                                    let sendData = {
                                        origin: clickedItemName,
                                        data: updata
                                    };
                                    console.log('updata !', updata);
                                    $.ajax({
                                        url: '/home/rooms/BankNameUpdata',
                                        type: 'POST',
                                        data: JSON.stringify(sendData),
                                        contentType: 'application/json',
                                        success: function (data) {
                                            console.log('Success:', data);
                                            const textElement = newDiv.querySelector('.qustionbank-text');
                                            textElement.textContent = escapeHtml(updata);
                                            makeQusBankCon.hide();
                                            makeQusBg.hide();
                                            document.getElementById("quesbank-input").value = ""
                                            document.getElementById("bankname").textContent = item.Itemname;
                                        },
                                        error: function (XMLHttpRequest, textStatus) {
                                            console.log(XMLHttpRequest)
                                            console.log(textStatus)
                                        }
                                    })
                                }
                                console.log('click !', clickedItemName)
                            } catch (e) {
                                console.error(e);
                            }
                        });
                    } catch (error) {
                        console.error('ajax error in input topic:', error.message);
                    }
                })
            });
        },
        error: function (XMLHttpRequest, textStatus) {
            console.log(XMLHttpRequest)
            console.log(textStatus)
        }
    });
});