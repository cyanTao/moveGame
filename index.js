(function(){
    //一个用来容纳2D绘图环境的容器
    var ctx = null;

    var Game = {
        canvas:document.getElementById("canvas"),
        setup:function(){
            ctx = this.canvas.getContext("2d");
            this.canvas.width = 408;
            this.canvas.height = 250;
            this.init();
        },
        animate:function(){
            Game.play = requestAnimFrame(Game.animate);
            Game.draw();
        },
        init:function(){
            //init包含了所有的对象的实例
            Background.init();
            Bricks.init();
            Ball.init();
            Paddle.init();
            Game.animate();
        },
        draw:function(){
            //draw用于处理所有更新并绘制对象的逻辑
            Background.draw();
            Bricks.draw();
            Ball.draw();
            Paddle.draw();
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
            this.row = 3;
            this.total = 0;
            this.count = [];
            for(var i=0;i<this.row;i++){
                this.count[i]=[];
            }
        },
        draw:function(){
            for(var i=0;i<this.row;i++){
                for(var j=0;j<this.col;j++){
                    if(!this.count[i][j]==false){
                        continue;
                    }
                    ctx.fillStyle = this.gradient(i);
                    ctx.fillRect(this.x(j),this.y(i),this.w,this.h);
                }
            }

        },
        collide:function(){
            this.total++;
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
            this.sx = 2;
            this.sy = -2;
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
            }else if(){
                //检测左边界
            }

            //检测右边界
        },
        //碰撞检测
        collide:function(){

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
            this.x+=this.speed;
        }
    };

    var Ctrl = {
        init:function(){

        }
    };

    window.requestAnimFrame = function(callback){
        window.setTimeout(callback,1000/60)
    }

    window.onload = function(){
        Game.setup();
    }

})()

