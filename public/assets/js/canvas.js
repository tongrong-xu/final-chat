$(document).ready(function(){

            
    //--------------------從這裡開始------------------------------
    
    
        /** @type {HTMLCanvasElement} */
        var canvas = document.getElementById("canvas");//設置畫布
        var context = canvas.getContext("2d");
    
    
        canvas.width = window.innerWidth; // 畫布寬 = 視窗內的寬
        canvas.height = window.innerHeight; // 畫布高 = 視窗內的高
    
        var img = [];//宣告圖片資源陣列
        var stage = new createjs.Stage("canvas");
        var canvas = document.getElementById("canvas");
        // var canvasCon = document.getElementById("canvas-con");
    
        var monsters = [];//題目陣列
    
    
        //圖片資源陣列
        var manifest = [
            {src:"./assets/img/boss.jpeg",id:"boss"},
            {src:"./assets/img/gun.jpg",id:"gun"},
            {src:"./assets/img/bullet.jpg",id:"bullet"},
            {src:"./assets/img/monster.png",id:"monster"}
        ];
    
    
        //-----------------------------以上變數-----------------------------
    
    
        var timer = 0;
        //自動更新舞台
        createjs.Ticker.framerate = 60; //設定更新頻率
    
        //自動生怪
        createjs.Ticker.addEventListener("tick", function() {
            stage.update();
    
            if(timer%90==0){
                // PaintMonster();
            }
            timer++;
        });
    
        window.onresize = onSizeChange;//監控size改變時呼叫此function
    
        onSizeChange();//設置初始畫布尺寸
        Loader();//開始載入
    
    
        //------------------------------------------------------------------
        //----------------------------以下為function-------------------------
        //------------------------------------------------------------------
    
    
        //及時調整畫布為螢幕大小
        function onSizeChange(){
            canvas.width = window.innerWidth; // 畫布寬 = 視窗內的寬
            canvas.height = window.innerHeight; // 畫布高 = 視窗內的高
            stage.update();
        }
    
        //繪製小怪(題目)
        function PaintMonster(){
            
            var monster = new createjs.Bitmap(img["monster"]);
            stage.addChild(monster);
            monster.x = canvas.width/2-150;
            monster.y = canvas.height/4-120;
            monster.scaleX = 0.05;
            monster.scaleY = 0.05;
    
            stage.update();
            MonsterMove(monster);
        }
    
        function MonsterMove(monster){
            // 設計移動速度和方向
            var speed = 2 + Math.random() * 3; // 設定速度在 2 到 5 之間
            var angle = Math.random() * Math.PI; // 隨機選取方向(下半圓)
    
            // 使用 TweenJS 實現移動和大小變化效果
            createjs.Tween.get(monster)
                .to(
                {
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
        function PaintBoss(){
    
            var boss = new createjs.Bitmap(img["boss"]);
            stage.addChild(boss);
            boss.x = canvas.width/2-150;
            boss.y = canvas.height/4-120;
            boss.scaleX = 0.8;
            boss.scaleY = 0.8;
    
            stage.update();
    
            return boss;
        }
    
        //繪製槍枝
        function PaintGun(){
            //槍枝
            var gun = new createjs.Bitmap(img["gun"]);
            gun.regX = gun.image.width / 2; // 設定圖片中心為 X 軸中心點
            gun.regY = gun.image.height / 2; // 設定圖片中心為 Y 軸中心點
            gun.x = canvas.width-400;
            gun.y = canvas.height-200;
            gun.scaleX = 0.2;
            gun.scaleY = 0.2;
            stage.addChild(gun);
            stage.update();
    
            return gun;
        }
    
    
        //載入圖片
        function Loader(){
    
            //創建載入圖片
            var loader = new createjs.LoadQueue(false);
            loader.loadManifest(manifest,true);
            //監聽載入序列
            loader.addEventListener("fileload", fileload);
            //監聽載入完成
            loader.addEventListener("complete", complete);
    
    
            function fileload(event){
                if (event.item.type == "image"){
                    img[event.item.id] = event.result;
                }
            }
    
            //載入完成刪除監聽並執行渲染函式
            function complete(event){
                event.target.removeEventListener("fileload",fileload);
                event.target.removeEventListener("complete",complete);
                init();
            }
    
        }
    
        //渲染圖片
        function init(){
            PaintBoss();
    
            //渲染後才呼叫準心渲染，避免準心被蓋住
            Crosshair();
        }
    
        //繪製準心
        function Crosshair(){
    
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
            canvas.addEventListener("mousemove", function(event){
                handleMouseMove(event,crosshair,gun);
            });
            
        }
    
        //滑鼠移動事件處理函式
        function handleMouseMove(event,crosshair,gun) {
    
            // 獲取canvas相對於視窗的位置
            var canvasRect = canvas.getBoundingClientRect();
    
            // 更新準心的位置為滑鼠的位置
            // crosshair.x = event.clientX - canvas.offsetLeft;
            // crosshair.y = event.clientY - canvas.offsetTop;
            crosshair.x = event.clientX - canvasRect.left;
            crosshair.y = event.clientY - canvasRect.top;
            GunRotate(event,gun);
    
        }
    
        //槍枝旋轉
        function GunRotate(event, gun) {
            // 計算滑鼠位置與槍枝圖片位置之間的角度
            var dx = event.clientX - canvas.offsetLeft - gun.x;
            var dy = event.clientY - canvas.offsetTop - gun.y;
            var radians = Math.atan2(dy, dx);
            var degrees = radians * (180 / Math.PI);
            
            // 將角度應用於槍枝圖片的旋轉
            gun.rotation = degrees+180;
    
            // 監聽滑鼠按下事件
            canvas.addEventListener("mousedown", function(event) {
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
            bullet.rotation = degrees+180;
    
            var targetX = event.clientX - canvas.offsetLeft;
            var targetY = event.clientY - canvas.offsetTop;
    
            createjs.Tween.get(bullet)
            .to({ x: targetX, y: targetY, scaleX: 0.5, scaleY: 0.5 }, 200)
            .call(function() {
                // 在抵達目標點時引爆
                explodeBullet(bullet.x, bullet.y);
    
                stage.removeChild(bullet);//隱藏砲彈
                bullet = null;//從記憶體移除砲彈
            });
            
            
        }
    
        function explodeBullet(x, y) {
            // 在目標點擊位置引爆，你可以在這裡執行相關的爆炸效果
            console.log("Bullet exploded at (" + x + ", " + y + ")");
        }
    
        //---------------------------------------------------------
        //-----------------------這裡結束---------------------------
        //---------------------------------------------------------
    
    });