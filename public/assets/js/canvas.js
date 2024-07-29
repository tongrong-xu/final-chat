$(document).ready(function () {


    //--------------------從這裡開始------------------------------


    /** @type {HTMLCanvasElement} */
    var canvas = document.getElementById("canvas"); //設置畫布
    var context = canvas.getContext("2d");


    canvas.width = window.innerWidth; // 畫布寬 = 視窗內的寬
    canvas.height = window.innerHeight; // 畫布高 = 視窗內的高

    var boss; //boss圖片
    var currentHealth = 1; // 初始boss血量
    var maxHealth = 800; // 最大boss血量
    var firstAppear = false;

    var img = []; //宣告圖片資源陣列
    var stage = new createjs.Stage("canvas");
    var canvas = document.getElementById("canvas");
    // var canvasCon = document.getElementById("canvas-con");

    var monsters = []; //題目陣列

    //boss震動參數
    var shakeConfig = {
        duration: 300,
        magnitude: 5
    };
    var bossX, bossY; //boss創建時座標，不受到動畫影響


    //圖片資源陣列
    var manifest = [{
            src: "./assets/img/boss/boss01-01.png",
            id: "boss01"
        },
        {
            src: "./assets/img/boss/boss01-02.png",
            id: "boss02"
        },
        {
            src: "./assets/img/boss/boss01-03.png",
            id: "boss03"
        },
        {
            src: "./assets/img/gun.png",
            id: "gun"
        },
        {
            src: "./assets/img/bullet.png",
            id: "bullet"
        },
        {
            src: "./assets/img/monster.png",
            id: "monster"
        },
        {
            src: "./assets/img/win.png",
            id: "winText"
        },
        {
            src: "./assets/img/lose.png",
            id: "loseText"
        }
    ];


    //-----------------------------以上變數-----------------------------


    var timer = 0;
    //自動更新舞台
    createjs.Ticker.framerate = 60; //設定更新頻率

    var haveBoss = false;

    //舞台更新
    createjs.Ticker.addEventListener("tick", function () {
        stage.update();
        if (haveBoss) {
            BossHP();
            if (currentHealth <= 0) {
                LetBossDie();
            }
        }


        if (timer == 10) {
            // WhenBossAppear();
        }
        if (timer % 90 == 0) {
            // PaintMonster();
        }
        //測試
        if (timer % 200 == 0) {
            // currentHealth++;

        }
        if (timer == 300) {
            // ChangeBossHpTo(200);
            // ChangeBossHP(-200);
        }
        if (timer == 500) {
            // ChangeBossHpTo(500);
            // ChangeBossHP(-200,300);
        }
        if (timer == 700) {
            // ChangeBossHpTo(100);
            // ChangeBossHP(-200);
        }


        timer++;
    });

    window.onresize = onSizeChange; //監控size改變時呼叫此function

    onSizeChange(); //設置初始畫布尺寸
    Loader(); //開始載入

    //--------------------測試----------------------

    $("#test-btn-01").click(function () {
        LetBossAppear();
    });

    $("#test-btn-02").click(function () {
        ChangeBossHP(-200);
    });

    $("#test-btn-03").click(function () {
        PaintWinOrLoseText("win");
    });

    $("#test-btn-04").click(function () {
        PaintWinOrLoseText("lose");
    });


    //------------------------------------------------------------------
    //----------------------------以下為function-------------------------
    //------------------------------------------------------------------

    //讓boss誕生，首次出題時調用此函式
    function LetBossAppear() {
        if (haveResult == true) {
            haveResult = false;
            HideWinOrLoseText("all");
        }

        if (haveBoss == false) {
            PaintBoss("boss01", true);
            currentHealth = 1;
            BossHP();
            WhenBossAppear();
            haveBoss = true;
        }
    }
    window.LetBossAppear = LetBossAppear;

    //讓boss死亡
    function LetBossDie() {
        haveBoss = false;
        BossShake();
        BossDamaged();
        stage.removeChild(boss);
        stage.removeChild(healthBar);
        healthBar = null;

        haveResult = true;
        PaintWinOrLoseText("win");
        // boss = null;
    }

    var healthBar;

    //繪製boss血條
    function BossHP() {
        var barWidth = 800;
        var barHeight = 15;

        if (!healthBar) {
            healthBar = new createjs.Shape();
            stage.addChild(healthBar);
        }

        //滿血長度
        healthBar.graphics.beginFill("#CCCCCC").drawRect(bossX - 190, bossY - 10, barWidth, barHeight);
        //目前血量
        var healthPercentage = currentHealth / maxHealth;
        var healthBarWidth = barWidth * healthPercentage;

        healthBar.graphics.beginFill("#FF0000").drawRect(bossX - 190, bossY - 10, healthBarWidth, barHeight);

    }

    //及時調整畫布為螢幕大小
    function onSizeChange() {
        canvas.width = window.innerWidth; // 畫布寬 = 視窗內的寬
        canvas.height = window.innerHeight; // 畫布高 = 視窗內的高
        stage.update();
    }


    //boss震動
    function BossShake(sheketime) {
        if (haveResult == false) {
            sheketime = sheketime / 2;
            createjs.Tween.get(boss)
                .to({
                    x: boss.x + shakeConfig.magnitude,
                    y: boss.y + shakeConfig.magnitude
                }, sheketime / 2, createjs.Ease.quadOut)
                .to({
                    x: boss.x - shakeConfig.magnitude,
                    y: boss.y - shakeConfig.magnitude
                }, sheketime, createjs.Ease.quadInOut)
                .to({
                    x: boss.x,
                    y: boss.y
                }, sheketime / 2, createjs.Ease.quadIn)
        }

    }

    //boss最初出現時的動畫
    function WhenBossAppear() {
        if (firstAppear == true) {
            // currentHealth += 5;
            createjs.Tween.get({
                    value: currentHealth
                })
                .to({
                    value: maxHealth
                }, 2500, createjs.Ease.quadInOut)
                .addEventListener("change", function (event) {
                    currentHealth = event.target.target.value;
                });
            BossFadeInOrOut("in");
            BossShake(500);

            //動畫跑完之後設置
            setTimeout(function () {
                firstAppear = false;
            }, 2500);
        }
    }

    //boss淡入淡出
    function BossFadeInOrOut(inOrOut) {
        if (inOrOut == "in") {
            boss.alpha = 0;
            createjs.Tween.get(boss)
                .to({
                    alpha: 1
                }, 500)
                .call(function () {
                    // console.log("Boss 淡入完成！");
                });
        } else if (inOrOut == "out") {
            boss.alpha = 1;
            createjs.Tween.get(boss)
                .to({
                    alpha: 0
                }, 500)
                .call(function () {
                    // console.log("Boss 淡出完成！");
                });
        }

    }

    //改變血量至指定數值(輸入目標剩餘血量)
    function ChangeBossHpTo(targetHealth, time = 500) {
        if (haveResult) {
            return;
        }

        if (targetHealth < 0) {
            targetHealth = 0;
        }
        createjs.Tween.get({
                value: currentHealth
            })
            .to({
                value: targetHealth
            }, time, createjs.Ease.quadInOut)
            .addEventListener("change", function (event) {
                currentHealth = event.target.target.value;
            });

        //目標血量低於現在時受傷
        if (targetHealth < currentHealth) {
            if (targetHealth <= 300) {
                ChangeBossImg(3);
            } else if (targetHealth <= 500) {
                ChangeBossImg(2);
            }
            BossShake(500);
            //受傷變半透明
            BossDamaged();

        }
    }

    //改變特定血量(輸入傷害值)，讓boss受傷調用這個，答題正確率>70%使用
    function ChangeBossHP(newHealth, time = 500) {
        if (haveResult) {
            return;
        }

        if (newHealth < 0) {
            BossShake(300);
        }

        targetHealth = currentHealth + newHealth;
        // console.log("tar = " + targetHealth + " cur =" + currentHealth + "new = "+newHealth);
        if (targetHealth < 0) {
            targetHealth = 0;
        } else if (targetHealth > maxHealth) {
            targetHealth = maxHealth;
        }

        createjs.Tween.get({
                value: currentHealth
            })
            .to({
                value: targetHealth
            }, time, createjs.Ease.quadIn)
            .addEventListener("change", function (event) {
                currentHealth = event.target.target.value;
            });

        if (newHealth < 0) {
            if (targetHealth <= 300) {
                ChangeBossImg(3);
            } else if (targetHealth <= 500) {
                ChangeBossImg(2);
            }
            BossShake(500);
            //受傷變半透明
            BossDamaged();
        }



    }
    window.ChangeBossHP = ChangeBossHP;
    //boss受傷
    function BossDamaged() {
        if (haveResult == false) {
            createjs.Tween.get(boss)
                .to({
                    alpha: 0.5
                }, 200)
                .to({
                    alpha: 1
                }, 200)
        }

    }

    //改變圖，暫未完成
    function ChangeBossImg(state) {
        if (firstAppear == false) {
            if (state == 2) {
                stage.removeChild(boss);
                PaintBoss("boss02", false)
            } else if (state == 3) {
                stage.removeChild(boss);
                PaintBoss("boss03", false)
            }
        }


    }

    //繪製小怪(題目)
    function PaintMonster() {

        var monster = new createjs.Bitmap(img["monster"]);
        stage.addChild(monster);
        monster.x = canvas.width / 2 - 150;
        monster.y = canvas.height / 4 - 120;
        monster.scaleX = 0.05;
        monster.scaleY = 0.05;

        stage.update();
        MonsterMove(monster);
    }


    //怪物移動
    function MonsterMove(monster) {
        // 設計移動速度和方向
        var speed = 2 + Math.random() * 3; // 設定速度在 2 到 5 之間
        var angle = Math.random() * Math.PI; // 隨機選取方向(下半圓)

        // 使用 TweenJS 實現移動和大小變化效果
        createjs.Tween.get(monster)
            .to({
                    x: monster.x + Math.cos(angle) * 800,
                    y: monster.y + Math.sin(angle) * 800,
                    scaleX: 0.3,
                    scaleY: 0.3
                },
                3000
            )
            .call(() => {
                // 移動完成後刪除 Monster
                monster.parent.removeChild(monster);
            });

        // 更新 Monster 位置
        monster.x += Math.cos(angle) * speed;
        monster.y += Math.sin(angle) * speed;
    }



    //繪製Boss
    function PaintBoss(imgN = "boss01", first = true) {
        boss = new createjs.Bitmap(img[imgN]);

        stage.addChild(boss);
        boss.x = canvas.width / 2 - 200;
        boss.y = canvas.height / 4 - 150;
        bossX = boss.x;
        bossY = boss.y;
        boss.scaleX = 0.2;
        boss.scaleY = 0.2;
        firstAppear = first;

        stage.update();

        return boss;
    }

    //繪製槍枝
    function PaintGun() {
        //槍枝
        var gun = new createjs.Bitmap(img["gun"]);
        gun.regX = gun.image.width / 2; // 設定圖片中心為 X 軸中心點
        gun.regY = gun.image.height / 2; // 設定圖片中心為 Y 軸中心點
        gun.x = canvas.width - 530;
        gun.y = canvas.height - 200;
        gun.scaleX = 0.25;
        gun.scaleY = 0.25;
        stage.addChild(gun);
        stage.update();

        return gun;
    }


    //載入圖片
    function Loader() {

        //創建載入圖片
        var loader = new createjs.LoadQueue(false);
        loader.loadManifest(manifest, true);
        //監聽載入序列
        loader.addEventListener("fileload", fileload);
        //監聽載入完成
        loader.addEventListener("complete", complete);


        function fileload(event) {
            if (event.item.type == "image") {
                img[event.item.id] = event.result;
            }
        }

        //載入完成刪除監聽並執行渲染函式
        function complete(event) {
            event.target.removeEventListener("fileload", fileload);
            event.target.removeEventListener("complete", complete);
            init();
        }

    }

    //渲染圖片
    function init() {


        //渲染後才呼叫準心渲染，避免準心被蓋住
        Crosshair();
    }

    //繪製準心
    function Crosshair() {

        // 建立準心(Crosshair)物件
        var crosshair = new createjs.Shape();
        crosshair.graphics.setStrokeStyle(1);
        crosshair.graphics.beginStroke("red");
        crosshair.graphics.moveTo(-10, 0).lineTo(10, 0);
        crosshair.graphics.moveTo(0, -10).lineTo(0, 10);

        //建立槍枝
        var gun = PaintGun();

        // 將準心放置在舞台中央
        crosshair.x = canvas.width / 2;
        crosshair.y = canvas.height / 2;
        stage.addChild(crosshair);

        // canvas.addEventListener("mousemove", handleMouseMove(event,crosshair));
        canvas.addEventListener("mousemove", function (event) {
            handleMouseMove(event, crosshair, gun);
        });

    }

    //滑鼠移動事件處理函式
    function handleMouseMove(event, crosshair, gun) {

        // 獲取canvas相對於視窗的位置
        var canvasRect = canvas.getBoundingClientRect();

        // 更新準心的位置為滑鼠的位置
        // crosshair.x = event.clientX - canvas.offsetLeft;
        // crosshair.y = event.clientY - canvas.offsetTop;
        crosshair.x = event.clientX - canvasRect.left;
        crosshair.y = event.clientY - canvasRect.top;
        GunRotate(event, gun);

    }

    //槍枝旋轉
    function GunRotate(event, gun) {
        // 計算滑鼠位置與槍枝圖片位置之間的角度
        var dx = event.clientX - canvas.offsetLeft - gun.x;
        var dy = event.clientY - canvas.offsetTop - gun.y;
        var radians = Math.atan2(dy, dx);
        var degrees = radians * (180 / Math.PI);

        // 將角度應用於槍枝圖片的旋轉
        gun.rotation = degrees + 180;

        // 監聽滑鼠按下事件
        canvas.addEventListener("mousedown", function (event) {
            fireBullet(event, gun);
        });
    }

    //發射砲彈
    function fireBullet(event, gun) {
        var bullet = new createjs.Bitmap(img["bullet"]);
        bullet.regX = bullet.image.width / 2;
        bullet.regY = bullet.image.height / 2;
        bullet.x = gun.x;
        bullet.y = gun.y;
        bullet.scaleX = 1;
        bullet.scaleY = 1;
        stage.addChild(bullet);

        var dx = event.clientX - canvas.offsetLeft - gun.x;
        var dy = event.clientY - canvas.offsetTop - gun.y;
        var radians = Math.atan2(dy, dx);
        var degrees = radians * (180 / Math.PI);
        bullet.rotation = degrees + 180;

        var targetX = event.clientX - canvas.offsetLeft;
        var targetY = event.clientY - canvas.offsetTop;

        createjs.Tween.get(bullet)
            .to({
                x: targetX,
                y: targetY,
                scaleX: 0.5,
                scaleY: 0.5
            }, 200)
            .call(function () {
                // 在抵達目標點時引爆
                explodeBullet(bullet.x, bullet.y);

                stage.removeChild(bullet); //隱藏砲彈
                bullet = null; //從記憶體移除砲彈
            });


    }

    function explodeBullet(x, y) {
        // 在目標點擊位置引爆，你可以在這裡執行相關的爆炸效果
        console.log("Bullet exploded at (" + x + ", " + y + ")");
    }

    var winText;
    var loseText;
    var haveResult = false;

    //勝敗畫面
    function PaintWinOrLoseText(whatResult) {
        if (whatResult == "win") {
            haveResult = true;
            winText = new createjs.Bitmap(img["winText"]);
            winText.regX = winText.image.width / 2;
            winText.regY = winText.image.height / 2;

            winText.x = canvas.width / 2;
            winText.y = canvas.height / 2 - 100;

            winText.scaleX = 0.25;
            winText.scaleY = 0.25;
            stage.addChild(winText);

            if (winText) {
                winText.alpha = 0
                createjs.Tween.get(winText)
                    .to({
                        alpha: 1
                    }, 400)
                    .call(function () {
                        // TextAnimation(winText);
                    })
            }
            TextAnimation(winText);

        } else if (whatResult == "lose") {
            haveResult = true;
            loseText = new createjs.Bitmap(img["loseText"]);

            loseText.regX = loseText.image.width / 2;
            loseText.regY = loseText.image.height / 2;

            loseText.x = canvas.width / 2;
            loseText.y = canvas.height / 2 - 100;
            loseText.scaleX = 0.25;
            loseText.scaleY = 0.25;
            stage.addChild(loseText);

            if (loseText) {
                loseText.alpha = 0
                createjs.Tween.get(loseText)
                    .to({
                        alpha: 1
                    }, 400)
                    .call(function () {
                        // TextAnimation(loseText);
                    })
            }

            TextAnimation(loseText);
        }
    }
    window.PaintWinOrLoseText = PaintWinOrLoseText;
    //隱藏勝敗text
    function HideWinOrLoseText(whatResult) {
        if (whatResult == "win") {
            if (winText) {
                createjs.Tween.get(winText)
                    .to({
                        alpha: 0
                    }, 400)
                    .call(function () {
                        stage.removeChild(winText);
                        winText = null;
                    });
            }

        } else if (whatResult == "lose") {
            if (loseText) {
                createjs.Tween.get(loseText)
                    .to({
                        alpha: 0
                    }, 400)
                    .call(function () {
                        stage.removeChild(loseText);
                        loseText = null;
                    });
            }
        } else if (whatResult == "all") {
            HideWinOrLoseText("win");
            HideWinOrLoseText("lose");
        }
        haveResult = false;
    }
    window.HideWinOrLoseText = HideWinOrLoseText;
    //放大縮小
    function TextAnimation(textObj) {
        if (haveResult) {
            var OscaleX = textObj.scaleX;
            var OscaleY = textObj.scaleY;
            createjs.Tween.get(textObj)
                .to({
                    scaleX: OscaleX * 1.5,
                    scaleY: OscaleY * 1.5
                }, 450, createjs.Ease.quadInOut)
                .to({
                    scaleX: OscaleX,
                    scaleY: OscaleY
                }, 450, createjs.Ease.quadInOut)
                .call(function () {
                    TextAnimation(textObj)
                });
        }
    }





    //---------------------------------------------------------
    //-----------------------這裡結束---------------------------
    //---------------------------------------------------------

    function resetBossScene() {
        // 檢查並移除Boss元素
        if (boss) {
            stage.removeChild(boss);
            boss = null;
        }

        // 檢查並移除血條元素
        if (healthBar) {
            stage.removeChild(healthBar);
            healthBar = null;
        }

        // 重置相關狀態
        currentHealth = 1;
        haveBoss = false;
        firstAppear = true; // 如果需要讓Boss每次出現都播放出現動畫

        // 隱藏勝敗文字
        HideWinOrLoseText("all");
        $(".qus-con").hide();
        // 這裡可以添加更多重置操作，比如清除怪物、重置計時器等
    }

    window.resetBossScene = resetBossScene; // 暴露給全局變量，以便在其他地方調用

});
