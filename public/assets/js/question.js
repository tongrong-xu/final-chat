$(document).ready(function(){
        // 您的題目內容
        var fileContent = `
        no:1
        qus:a,
        option1:b,
        option2:c,
        option3:d,
        option4:e,
        answer:1
        ;
        no:2
        qus:a2,
        option1:b2,
        option2:c2,
        option3:d2,
        option4:e2,
        answer:2
        ;
        no:3
        qus:a3,
        option1:b3,
        option2:c3,
        option3:d3,
        option4:e3,
        answer:3
        ;
      `;
  
      // 解析題目內容
      var questions = parseFileContent(fileContent);
      // console.log(questions);
  
      // 解析文本檔內容，將每個題目解析為對象並存入二維陣列中
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
      var outputDiv = document.getElementById("output");
      questions.forEach(function (question, index) {
        var questionDiv = document.createElement("div");
        questionDiv.className = "qus-text-con row";
        $(questionDiv).css("height","auto");
        questionDiv.innerHTML = `
            <div class="qus-text col-9">${index + 1}.${question.qus}</div>
            <div class="qus-text-state col-3">未完成</div>
        `;
        outputDiv.appendChild(questionDiv);
      });

      //--------出題-------------
      const qus = $(".qus");
      const options = $(".options");

      Question();

      //隨機選取題目並顯示在畫面上
      function Question(){
        var randomIndex = parseInt(Math.floor(Math.random() * questions.length));
        qus.text(questions[randomIndex]["qus"]);
        qus.attr("no",randomIndex+1);

        for(var i=0;i<4;i++){
            var index = "option" + (i+1).toString();
            $(options[i]).text(questions[randomIndex][index]);
        }
      }

      options.click(function(event){
        var no = $(this).attr("no");//第幾個選項
        console.log(no);
        console.log(questions[parseInt(qus.attr("no"))-1]["answer"]);
        if(no == questions[parseInt(qus.attr("no"))-1]["answer"]){
            console.log("答對了");
        }
        else{
            console.log("答錯了");
        }
      });


      //------------老師出題-----------------------------
      const makeQusCon = $(".make-quetion-con");
      const qusSubBtn = $("#make-qus-btn-t");


      //測試makeQus()用
      qusSubBtn.click(function(){
        var qus = makeQus();
        console.log(qus);
      });

      //抓取輸入的題目資料
      function makeQus(){
        var qus = {
          qustion:$("#question-textarea").val(),
          options1: $(".qus-opation-name").eq(0).val(),
          options2: $(".qus-opation-name").eq(1).val(),
          options3: $(".qus-opation-name").eq(2).val(),
          options4: $(".qus-opation-name").eq(3).val(),
          correct:$(".qus-opation:checked").val()
        }

        return qus;
      }
});