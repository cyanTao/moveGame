(function(){

    //优化游戏
    //实现并维持玩家的得分;(本地存储)
    //集成得分的社区分享功能;
    //整合关卡系统
    //增加一个游戏介绍与游戏结束界面;

    //一个用来容纳2D绘图环境的容器
    var ctx = null;

    var Game = {
        canvas:document.getElementById("canvas"),
        levelUp:function(){
            Hub.lv++;
            Ball.init();
            Bricks.init();
        },
        levelLimit:function(lv){
            return lv>5?5:lv
        },
        setup:function(){
            ctx = this.canvas.getContext("2d");
            this.canvas.width = 408;
            this.canvas.height = 250;
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            Screen.welcome();
            this.canvas.addEventListener('click',this.runGame);
            Ctrl.init();
        },
        runGame:function(){
            Game.canvas.removeEventListener("click",Game.runGame);
            Game.init();
            Game.animate();
        },
        animate:function(){
            Game.play = requestAnimationFrame(Game.animate);
            Game.draw();
        },
        init:function(){
            //init包含了所有的对象的实例
            Background.init();
            Hub.init();
            Bricks.init();
            Ball.init();
            Paddle.init();
        },
        draw:function(){
            //draw用于处理所有更新并绘制对象的逻辑
            Background.draw();
            Hub.draw();
            Bricks.draw();
            Ball.draw();
            Paddle.draw();

        },
        reGame:function () {
            Game.canvas.removeEventListener('click',Game.reGame);

            Game.init();
        }

    };

    var Background = {
        init:function(){
            this.ready = false;
            this.img = new Image();
            this.img.src = "background.jpg";
            this.img.onload = function(){
                Background.ready = true;
            }
        },
        draw:function(){
            if(this.ready){
                ctx.drawImage(this.img,0,0);
            }
        }
    };

    var Bricks = {
        gap:2,
        col:5,
        w:80,
        h:15,
        init:function(){
            this.row = 2+Game.levelLimit(Hub.lv);
            this.total = 0;
            this.count = [];
            for(var i=0;i<this.row;i++){
                this.count[i]=[];
            }
        },
        draw:function(){
            for(var i=0;i<this.row;i++){
                for(var j=0;j<this.col;j++){
                    if(this.count[i][j]!=false){
                        if(Ball.x>=this.x(j)&&Ball.x<=(this.x(j)+this.w)&&(Ball.y-Ball.r)>=this.y(i)&&(Ball.y-Ball.r)<=this.y(i)+this.h){
                            //碰撞侦测，判断小球是否与当前重绘的砖块发生重叠，如果发生重叠，就调用collide方法
                            this.collide(i,j);
                            continue;
                        }
                        ctx.fillStyle = this.gradient(i);
                        ctx.fillRect(this.x(j),this.y(i),this.w,this.h);
                    }
                }
            }
            if(this.total==(this.row*this.col)){
                //调用升级方法
                Game.levelUp();
            }

        },
        collide:function(i,j){
            //当小球碰到砖块，小球的y坐标的速度取负
            this.count[i][j]=false;
            this.sy = -this.sy;
            this.total++;
            Hub.score++;
        },
        x:function(col){
            //根据砖块所在列，计算横坐标
            return (this.w+this.gap)*col;
        },
        y:function(row){
            //根据砖块所在行，计算纵坐标
            return (this.h+this.gap)*row;
        },
        gradient:function(row){
            switch(row){
                case 0:
                    return this.gradientPurple?this.gradientPurple:this.gradientPurple=this.makeGradient(row,'#bd06f9','#9604c7');
                case 1:
                    return this.gradientRed?this.gradientRed:this.gradientRed=this.makeGradient(row,'#f9064a','#c7043b');
                case 2:
                    return this.gradientGreen?this.gradientGreen:this.gradientGreen=this.makeGradient(row,'#05fa15','#04c711');
                default:
                    return this.gradientOrange?this.gradientOrange:this.gradientOrange=this.makeGradient(row,'#faa105','#c77f04');
            }
        },
        makeGradient:function(row,color1,color2){
            var y = this.y(row);
            var grad = ctx.createLinearGradient(0,y,0,y+this.h);
            grad.addColorStop(0,color1);
            grad.addColorStop(1,color2);
            return grad;
        }
    };

    var Ball = {
        r:10,
        init:function(){
            //初始化球的坐标，速度
            this.x = 120;
            this.y = 120;
            this.sx = 1+Hub.lv*0.4;
            this.sy = -1.5-Hub.lv*0.4;
        },
        draw:function(){
            //检测小球
            this.edges();
            this.collide();
            this.move();
            //画出小球
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,2*Math.PI);
            ctx.closePath();
            ctx.fillStyle="#ccc";
            ctx.fill()
        },
        //边沿检测
        edges:function(){
            if(this.y<1){
                //检测上边界
                this.y = 1;
                this.sy = -this.sy;
            }else if(this.y>Game.height){
                //检测下边界
                this.sy=this.sx=0;
                this.y = this.x = 1000;
                Screen.gameover();
                Game.canvas.addEventListener('click',Game.reGame);
            }
            if(this.x<1){
                //检测左边界
                this.x = 1;
                this.sx = -this.sx;
            }else if(this.x>Game.width){
                //检测右边界
                this.x = Game.width-1;
                this.sx = -this.sx;
            }

        },
        //碰撞检测
        collide:function(){
            if(this.x>=Paddle.x&&this.x<=(Paddle.x+Paddle.w)&&(this.y+this.r)>=Paddle.y&&(this.y+this.r)<=(Paddle.y+Paddle.h)){
                this.sy = -this.sy;
                this.sx = (this.x-(Paddle.x+Paddle.w/2))/Paddle.w*7;
            }
        },
        //使小球移动
        move:function(){
            this.x+=this.sx;
            this.y+=this.sy;
        }
    };

    var Paddle = {
        w:90,
        h:20,
        init:function(){
            this.x = 100;
            this.y = 210;
            this.speed = 4;
        },
        draw:function(){
            this.move();
            ctx.beginPath();
            ctx.fillStyle = "#ccc";
            ctx.rect(this.x,this.y,this.w,this.h);
            ctx.closePath();
            ctx.fill()
        },
        move:function(){
            if(Ctrl.left&&(this.x>-this.w/2)){
                this.x-=this.speed;
            }else if(Ctrl.right&&(this.x<Game.width-this.w/2)){
                this.x+=this.speed;
            }
        }
    };

    var Ctrl = {
        init:function(){
            window.addEventListener("mousemove",this.movePaddle);

            window.addEventListener("keydown",this.keydown);
            window.addEventListener("keyup",this.keyup);

            window.addEventListener("touchstart",this.movePaddle);
            window.addEventListener("touchmove",this.movePaddle);
            window.addEventListener("touchmove",this.stopTouchScroll);
        },
        movePaddle:function(e){
            if(e.touches){
                var mouseX = e.touches[0].clientX;
            }else{
                var mouseX = e.pageX;
            }
            var canvasX = Game.canvas.offsetLeft;
            var paddleMid = Paddle.w/2;
            if(mouseX>canvasX&&mouseX<Game.width+canvasX){
                var newX = mouseX-canvasX-paddleMid;
                Paddle.x = newX;
            }
        },
        keydown:function(e){
            //左方向键37，右方向键39
            switch(e.keyCode){
                case 39:
                    Ctrl.right = true;
                    break;
                case 37:
                    Ctrl.left = true;
                    break;
                default:
                    break;
            }
        },
        keyup:function(e){
            switch(e.keyCode){
                case 39:
                    Ctrl.right = false;
                    break;
                case 37:
                    Ctrl.left = false;
                    break;
                default:
                    break;
            }
        },
        stopTouchScroll:function(e){
            e.preventDefault();
        }
    };

    var Hub = {
        init:function(){
            this.lv = 1;
            this.score = 0;
        },
        draw:function(){
            ctx.font = "12px 微软雅黑";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText("得分:"+this.score,5,Game.height-5);
            ctx.textAlign = "right";
            ctx.fillText("等级:"+this.lv,Game.width-5,Game.height-5);

        }
    };

    var Screen = {

        welcome:function(){
            //界面基本数值
            this.text = "小游戏";
            this.textSub = "点击开始游戏";
            this.textColor = "white";
            this.create();
        },
        gameover:function(){
            //界面基本数值
            this.text = "Game Over";
            this.textSub = "点击重新开始";
            this.textColor = "white";
            this.textScore = '得分:';
            this.textlv = '等级:';
            Screen.create();
        },
        create:function(){
            ctx.fillStyle = "#000";
            ctx.fillRect(0,0,Game.width,Game.height);

            ctx.fillStyle = this.textColor;
            ctx.textAlign = "center";
            ctx.font = "40px 微软雅黑";
            ctx.fillText(this.text,Game.width/2,Game.height/2);

            ctx.fillStyle ="#999";
            ctx.font = "20px 微软雅黑";
            ctx.fillText(this.textSub,Game.width/2,Game.height/2+40);

            if(!isNaN(Hub.score)){
                ctx.fillText(this.textScore+Hub.score,Game.width*2/3,Game.height/2+80);
                ctx.fillText(this.textlv+Hub.lv,Game.width/3,Game.height/2+80);
            }

        }
    }

    window.requestAnimFrame = function(callback){
        window.setTimeout(callback,1000/60)
    }

    window.onload = function(){
        Game.setup();
    }

})()

