$(document).ready(function () {
  const socket = io();
  let Isteacher = false
  $.ajax({
    url: '/home/rooms/QSbankData',
    type: 'GET',
    success: function (data) {
      if (data.role == "teacher") {
        data.qsname.forEach((qusItem, index) => {
          CreateQusBankDom(index, {
            id: index,
            name: qusItem.Itemname,
            qusNum: qusItem.topic.length
          });
        });
        Isteacher = true
      }
    },
    error: function () {

    }
  });


  let count = 0;
  var qustionQueue = $("#nowQus-con");
  //創建目前已出題題目
  function CreatNowQusDom(question = {
    name: "預設題目",
    index: 0,
    reslut: "未完成"
  }) {

    let newQusDom = `
        <div class="qus-text-con row" style="height:auto" id="${question["index"]}">
          <div class="col row member-username-con member-con">
              <div class="qus-text col-9">${question["index"]}.${question["name"]}</div>
              <div class="qus-text-state col-3">${question["reslut"]}</div>
          </div>
          <hr>
        </div>
      `;

    qustionQueue.append(newQusDom);
    // $(outputDiv).append(newQusDom);

    return newQusDom;
  }

  function changeQueueState(index, state) {
    let queue = $("#nowQus-con");
    let selectedElement = queue.find(`#${index}`);
    if (selectedElement.length) {
      selectedElement.find(".qus-text-state").text(state);
    } else {
      console.error(`Element with index ${index} not found.`);
    }
  }


  function parseFileContent(content) {
    var questionBlocks = content.trim().split(';');
    var questionArray = [];

    questionBlocks.forEach(function (block) {
      var lines = block.trim().split('\n');
      var question = {};

      lines.forEach(function (line) {
        var parts = line.split(':');
        if (parts.length === 2) {
          var key = parts[0].trim();
          var value = parts[1].trim().replace(",", ""); // 去除值中的逗號
          question[key] = value;
        }
      });

      if (Object.keys(question).length > 0) {
        questionArray.push(question);
      }
    });

    return questionArray;
  }

  // 顯示解析後的結果
  var outputDiv = document.getElementById("nowQus-con");
  /*questions.forEach(function (question, index) {

    let result = "未完成"; //三種狀態，未完成、完成、進行中

    var questionDiv = document.createElement("div");

    questionDiv.className = "qus-text-con row";
    $(questionDiv).css("height", "auto");

    questionDiv.innerHTML = `
      <!-- 自己 -->
      <div class="col row member-username-con" id="member-con">
          <div class="qus-text col-9">${index + 1}.${question.qus}</div>
          <div class="qus-text-state col-3">${result}</div>
      </div>
      <hr>
  `;

    outputDiv.appendChild(questionDiv);
  });*/
  //Question();

  //隨機選取題目並顯示在畫面上
  var qusDiv = $(".qus");
  var options = $(".options");
  var isAnswerCorrect = false;
  const useridElement = document.getElementById('myid');

  function Question(data) {
    //--------出題-------------
    qusDiv.text(data[0].qus);
    qusDiv.attr("no", data[0].no); // 設置問題編號

    // 更新選項文本
    for (var i = 0; i < 4; i++) {
      var option = data[0]["option" + (i + 1)];
      $(options[i]).find(".text").text(option);
    }

    let question = {
      name: data[0].qus,
      index: data[0].no,
      reslut: "未完成"
    };
    CreatNowQusDom(question);

    if (!Isteacher) {
      // 添加選項的點擊事件處理程序
      options.click(function (event) {
        var no = $(this).attr("no"); // 獲取選項編號
        if (no == data[0].answer) {
          console.log("答對了");
          changeQueueState(data[0].no, "答對了")
          socket.emit('qusTrue', {
            data: data[0],
            id: useridElement.value,
            state: 'True'
          })
          isAnswerCorrect = true
        } else {
          console.log("答錯了");
          changeQueueState(data[0].no, "答錯了")
          socket.emit('qusFalse', {
            data: data[0],
            id: useridElement.value,
            state: 'False'
          })
          isAnswerCorrect = true
        }
        options.off("click");
      });
    }
    if (Isteacher) {
      setTimeout(function () {
        socket.emit('qusState', {
          data: data[0],
          id: useridElement.value,
          state: 'Unfinish'
        })
      }, 10000);
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  //------------老師出題-----------------------------

  let qusBank = $(".qus-bank");
  const qusBankParent = $(".qustionbank-parent");
  const makeQusCon = $(".make-quetion-con");
  const qusSubBtn = $("#make-qus-btn-t");

  const qustionInBank = $(".qus-inleft-parent");
  const qustBankParent = $(".qustionbank-parent");
  const qusNumText = $(".qusion-number");


  //對父母設置事件委託
  qusBankParent.on("click", ".qus-bank", QusBankClick)

  //選擇題庫
  function QusBankClick() {
    if ($(this).hasClass("qusbank-choose")) {
      return;
    } else {
      qusBank.each(function () {
        qusBank.removeClass("qusbank-choose");
      });
      $(this).addClass("qusbank-choose");

      //讀取題庫ID
      const nowQusBankId = parseInt($(this).attr("qusbank-id"));

      const qusBankname = $(this).find('.qus-bank-name').text()

      console.log('qusBankname', qusBankname, nowQusBankId)

      if (qusBankname) {
        let sendData = {
          data: qusBankname
        };
        $.ajax({
          url: '/home/rooms/Questiontopic',
          type: 'POST',
          data: JSON.stringify(sendData),
          contentType: 'application/json',
          success: function (data) {
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

      //重置題目
      qustionInBank.empty();
      // console.log(this)
      qusIndex = 0;
    }
  }


  //測試makeQus()用
  qusSubBtn.click(function () {
    var qus = makeQus();
    console.log(qus);
  });

  //抓取輸入的題目資料
  function makeQus() {
    var qus = {
      qustion: $("#question-textarea").val(),
      options1: $(".qus-opation-name").eq(0).val(),
      options2: $(".qus-opation-name").eq(1).val(),
      options3: $(".qus-opation-name").eq(2).val(),
      options4: $(".qus-opation-name").eq(3).val(),
      correct: $(".qus-opation:checked").val()
    }

    return qus;
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
    createDate: "2023-09-13"
  }) {

    qusContent["qusIndex"] = qusIndex

    let qusDom = `
<!-- 題目 -->
<div class="col align-items-center qus-left-con" qus-id="1">
    <div class="col-12 line-clamp-1 qus-name">${qusContent["qustion"]}</div>
</div>
<hr style="margin: 0;">
`;

    //加入正解變色
    $(qusDom).find(".qus-btn").each(function (i) {
      if (i == (qusContent["correct"] - 1)) {
        $(this).addClass("qus-btn-correct");
        // console.log($(this).get())
      }
    });

    qustionInBank.append(qusDom);

    let qusNum = parseInt(qusNumText.attr("qus-num")) + 1;
    qusNumText.attr("qus-num", qusNum.toString());
    qusNumText.text("題目數量：" + qusNum);

    qusBtn = $(".qus-btn");

    return qusDom;
  }

  //創建題庫dom
  function CreateQusBankDom(qusBankId, qusBankObj = {
    id: 0,
    name: "預設題庫名稱",
    qusNum: 0 //題庫內題目數量
  }) {
    qusBankObj["id"] = qusBankId;

    let qusBankDom = `
  <!-- 題庫 -->
  <div class="col row align-items-center qus-bank" qusbank-id="${qusBankObj["id"]}">
      <div class="col-12 line-clamp-1 qus-bank-name" value="${qusBankObj["name"]}">${qusBankObj["name"]}</div>
  </div>
  <hr style="margin: 0;">
  `;

    qustBankParent.append(qusBankDom);
    // console.log(qusBankDom)

    //重新設定監聽
    qusBank = $(".qus-bank");


    return qusBankDom;
  }

  //自動創建題庫dom
  /*var qusBankIndex = 0;
  setInterval(function () {
    CreateQusBankDom(qusBankIndex)

    qusBankIndex++;
  }, 3000);

  //自動創建題目dom
  var qusIndex = 1;
  setInterval(function () {
    createQustionDom(qusIndex);


    qusIndex++;
  }, 3000);*/

  //----------------------------------------------
  const fullUrl = window.location.href;
  const roomCode = fullUrl.split('/').pop();
  const RoomCode = roomCode.replace('Room_', '');
  let Data = 0;
  let topicQuantity = 0;
  let intervalId;
  socket.emit('QusRoomCode', {
    RoomCode: RoomCode
  })

  $.ajax({
    url: '/home/rooms/userAnswers',
    type: 'POST',
    data: JSON.stringify({
      RoomCode: RoomCode
    }),
    contentType: 'application/json',
    success: function (response) {
      const stateMapping = {
        True: '答對了',
        False: '答錯了',
        Unfinish: '未完成'
      };
      response.userAnswersResults.forEach((qusItem) => {
        topicQuantity++;
        CreatNowQusDom({
          index: topicQuantity,
          name: qusItem.questionText,
          reslut: stateMapping[qusItem.state] || qusItem.state
        });
      });
    },
    error: function (error) {
      console.error('錯：', error);
    }
  });

  //----------------老師選擇題目並出題--------------
  let qusLeftCon = $(".qus-left-con");
  const qusInLeftParent = $(".qus-inleft-parent");
  const submitNewQusToGameBtn = $("#submit-new-qus-to-game");
  // 顯示出題的結果
  let nowQusCon = $("#nowQus-con");

  //選取問題
  function qusLeftConClick() {
    if ($(this).hasClass("qus-left-con-choose")) {
      $(this).removeClass("qus-left-con-choose");
    } else {
      $(this).addClass("qus-left-con-choose");
    }
  }
  qusInLeftParent.on("click", ".qus-left-con", qusLeftConClick);

  function sendDataToClients(num, dataBata) {
    if (Data < num) {
      socket.emit('dataBata', dataBata[Data]);
      Data++;
    } else {
      Data = 0;
    }
  }


  function convertDataToText(data) {
    topicQuantity++;
    let fileContent = '';
    fileContent += `no:${topicQuantity}\n`;
    fileContent += `qus:${data.topic},\n`;

    for (let i = 0; i < data.ans.length; i++) {
      fileContent += `option${i + 1}:${data.ans[i]},\n`;
    }

    fileContent += `answer:${data.correctOption}\n`;

    fileContent += ';\n';

    return fileContent;
  }


  function SubmitNewQusToGameBtnClick(event) {
    //現在選取
    // 創建一個空數組，用於存儲已選擇的問題字符串
    let selectedQuestions = [];
    // 創建一個空數組，用於存儲已選擇的題庫部分
    let selectedQusBankParts = [];

    // 獲取所有已選擇的問題元素
    let nowChooseQus = $(".qus-left-con-choose");
    let nowChooseQusBankParts = $(".qusbank-choose");

    // 遍歷已選擇的問題元素並獲取文本內容，然後添加到數組中
    nowChooseQus.each(function () {
      let questionText = $(this).find(".qus-name").text();
      selectedQuestions.push(questionText);
    });

    // 遍歷已選擇的題庫部分並獲取相關數據，然後添加到數組中
    nowChooseQusBankParts.each(function () {
      selectedQusBankParts.push($(this).find(".qus-bank-name").text());
    });

    // 創建一個對象，包含問題字符串數組和已選擇的題庫部分數組
    let requestData = {
      selectedQuestions: selectedQuestions,
      selectedQusBankParts: selectedQusBankParts
    };

    $.ajax({
      url: '/home/rooms/QusToGame',
      type: 'POST',
      data: JSON.stringify(requestData),
      contentType: 'application/json',
      success: function (response) {
        console.log('後端：', response.topicview);

        intervalId = setInterval(function () {
          sendDataToClients(response.topicview.length, response.topicview);
          isAnswerCorrect = false
          if (Data == response.topicview.length) {
            clearInterval(intervalId);
            socket.emit('noqus')
          }
        }, 12000);
      },
      error: function (error) {
        console.error('錯：', error);
      }
    });
    //移除選取

    nowChooseQus.removeClass("qus-left-con-choose");
  }

  socket.on('connect', function () {
    socket.on('playgame', function (data) {
      let text = convertDataToText(data)
      var qus = parseFileContent(text)
      Question(qus)
      setTimeout(function () {
        if (!isAnswerCorrect) {
          console.log('noclick！');
          options.off("click");
        }
      }, 10000);
      console.log(qus)
      if (Isteacher) {
        socket.off('percent'); // 移除之前的監聽器
        socket.on('percent', function (data) {
          console.log('percent', data)
        });
      }

    });
  });
  //送出已選取的問題
  submitNewQusToGameBtn.click(SubmitNewQusToGameBtnClick);

});