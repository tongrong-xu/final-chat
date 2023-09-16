$(document).ready(function () {
    //左邊題庫
    let qusBank = $(".qus-bank");

    //右邊題目
    const qustionInBank = $(".qustion-in-bank");
    const qustBankParent = $(".qustionbank-parent");
    const qusNumText = $(".qusion-number");


    var nowQusBankId = 0; //目前選擇的題庫id

    //選擇題庫
    qusBank.click(function () {
        qusBank.each(function () {
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
    function createQustionDom(qusIndex = 0) {
        let qusContent = {
            qustion: "預設題目",
            option1: "選項A",
            option2: "選項B",
            option3: "選項C",
            option4: "選項D",
            correct: 1,
            //此題庫內第幾個題目
            qusIndex: 3,
            createDate: "2023-09-13"
        }

        qusContent["qusIndex"] = qusIndex

        let qusDom = `
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
        $(qusDom).find(".qus-btn").each(function (i) {
            if (i == (qusContent["correct"] - 1)) {
                $(this).addClass("qus-btn-correct");
                // console.log($(this).get())
            }
        });

        return qusDom;
    }

    //創建題庫dom
    function CreateQusBankDom(qusBankId) {
        let qusBankObj = {
            id: 0,
            name: "預設題庫名稱",
            qusNum: 0 //題庫內題目數量
        };
        qusBankObj["id"] = qusBankId;

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

    document.getElementById('item').addEventListener('submit', function (event) {
        const inputElement = document.getElementById('question-textarea');
        const userInput = inputElement.value;
        if (userInput.trim() === '' || userInput === '\n' || userInput === '\r\n') {
            console.log(userInput)
        }
    });
    //控制選項
    const editQusBtn = $(".edit-qus");
    const createQusBtn = $(".create-qus");
    let editClassName = $(".edit-qus-name-input");
    let editClassNameSub = $(".edit-qus-name-submit");

    //編輯題目
    editQusBtn.click(function () {
        let editMode = editQusBtn.attr("edit-mode");
        console.log(editMode)
        if (editMode == "false") {
            editQusBtn.attr("edit-mode", "true");
            editQusBtn.children(".edit-true").hide();
            editQusBtn.children(".edit-false").show();
            editClassName.show();
            editClassNameSub.show();

        } else {
            editQusBtn.attr("edit-mode", "false");
            editQusBtn.children(".edit-true").show();
            editQusBtn.children(".edit-false").hide();
            editClassName.hide();
            editClassNameSub.hide();
        }
    });

    //更改題目名稱
    editClassNameSub.click(function () {
        let newName = $(this).siblings(".edit-qus-name-input").val();
        $(this).siblings(".qus-name").text(newName);
    });


    const makeQusCon = $("#topic");
    makeQusCon.hide();
    const makeQusBackv = $("#make-qus-backv");
    const makeQusBack = $("#make-qus-back");
    const makeQusBg = $("#make-qus-bg");
    makeQusBg.hide()

    const itemCon = $("#item");
    itemCon.hide();

    const itemfrom = $("#itemfrom");
    itemfrom.click(function () {
        itemCon.show();
        makeQusBg.show();
    });
    makeQusBackv.click(function () {
        itemCon.hide();
        makeQusBg.hide();
    });

    function formatDate(isoDateString) {
        const date = new Date(isoDateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, (match) => map[match]);
    }
    // 引入Socket.io庫
    const socket = io();
    const qustionbank = document.getElementById('SQB');
    const QSBname = document.getElementById('QSBname');
    const QSBnum = document.getElementById('QSBnum');
    const accordionExample = document.getElementById('accordionExample');
    socket.on('connect', function () {
        socket.on('qsname', (qsname) => {
            console.log('qsname', qsname)
            qsname.forEach((qsn, index, name) => {
                // 創建新的<div>元素
                const newDiv = document.createElement('div');
                newDiv.className = 'col row align-items-center qus-bank';
                // 設置自訂屬性以供後續使用
                newDiv.setAttribute('qusbank-id', index + 1);
                // 創建內部HTML內容
                newDiv.innerHTML = `
                  <div class="col-9 line-clamp-1 qustionbank-text">${escapeHtml(qsn.Itemname)}</div>
                  <div class="col-3 rank">編輯</div>
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
                        newDiv.classList.add("qusbank-choose")
                        QSBname.textContent = qsn.Itemname;
                        accordionExample.innerHTML = ''
                        const item = qsn.Itemname
                        QSBnum.textContent = '題目數量：' + qsn.topic.length
                        const requestData = {
                            Itemname: item
                        };

                        createQusBtn.click(function () {
                            makeQusCon.show();
                            makeQusBg.show();
                        });

                        makeQusBack.click(function () {
                            makeQusCon.hide();
                            makeQusBg.hide();
                        });
                        const requestBody = JSON.stringify(requestData);
                        document.getElementById('extradata').value = `${item}`;
                        const response = await fetch('/home/rooms/topic/Questiontopic', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: requestBody
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        const data = await response.json(); // Parse the JSON response
                        console.log('data:', data.topicview)
                        const view = data.topicview
                        view.forEach((question, index) => {
                            const formattedDate = formatDate(question.createdAt);
                            const questionDom = `
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="heading${index+1}">
                                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                                            <div class="create-date">
                                            ${formattedDate}
                                            </div>
                                            <div class="qus-name">
                                                ${escapeHtml(question.topic)}
                                            </div>
                                        </button>
                                    </h2>
                                    <div id="collapse${index+1}" class="accordion-collapse collapse show" aria-labelledby="heading${index}" data-bs-parent="#accordionExample">
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
                            `;

                            accordionExample.innerHTML += questionDom;
                        });
                        // Handle the 'data' as needed
                    } catch (error) {
                        console.error('Fetch error:', error.message);
                    }
                })
            });
        })
    })
});