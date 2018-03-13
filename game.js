(()=>{//以后将所有的javascript代码都放到这个自执行函数中，从而防止变量泄露到全局范围
    //  quchu//[^*]{0,}
    //一个用来容纳2D绘图环境的空变量
    let ctx = null;

    const Game={
        canvas:document.querySelector('canvas'),
        setup:()=>{
            if(Game.canvas.getContext){
                ctx = Game.canvas.getContext('2d');
                //从canvas元素中获取宽高值
                Game.width=Game.canvas.width;
                Game.height=Game.canvas.height;

                Screen.welcome();
                Game.canvas.addEventListener('click',Game.runGame,false);//添加新的事件监听器
                Ctrl.init();
            }
        },
        runGame:()=>{
            Game.canvas.removeEventListener('click',Game.runGame,false);//事件触发后就去除事件监听器
            //点击后初始化游戏界面
            Game.init();

            Game.animate();
        },
        animate:()=>{
            Game.play=requestAnimFrame(Game.animate);
            Game.draw();
        },
        //init()包含了所有的对象实例
        init:()=>{
            Background.init();
            Hub.init();

            Ball.init();
            Paddle.init();
            Bricks.init();

            
        },
        //draw()用于处理所有更新并绘制对象的逻辑
        draw:()=>{
            //将canvas绘图板清空，每次更新他时，之前绘制的图形就会被清除
            ctx.clearRect(0,0,Game.width,Game.height);

            Background.draw();
            Bricks.draw();
            Paddle.draw();
            Hub.draw();
            Ball.draw();
        },
        levelUp:()=>{
            Hub.lv+=1;
            Bricks.init();
            Ball.init();
            Paddle.init();
        },
        levelLimit:function(lv){
            return lv>5?5:lv;//将砖块限定为最高只能到达5行;
        },
        restartGame:()=>{
            Game.canvas.removeEventListener('click',Game.restartGame,false);
            Game.init();
        }
    };
    
    //自此而下的这些对象包含了游戏的所有可视化资源
    const Background={
        init:()=>{
            Background.ready=false;
            Background.img=new Image();
            Background.img.src='background.jpg';

            Background.img.onload=()=>{
                Background.ready=true;
            };
        },
        draw:()=>{
            if(Background.ready){
                ctx.drawImage(Background.img,0,0);
            }
        }
    };

    const Bricks={
        gap:2,
        col:5,
        w:80,
        h:15,
        init:()=>{
            Bricks.row=2+Game.levelLimit(Hub.lv);//砖块的行数现在和所处关卡匹配起来
            Bricks.total=0;

            Bricks.count=[Bricks.row];
            //砖块数组由砖块的行列号数据所构成
            for(let i=0;i<Bricks.row;i++){
                Bricks.count[i]=[Bricks.col];
            }
        },
        draw:()=>{
            let i,j;
            for(i=0;i<Bricks.row;i++){
                for(j=0;j<Bricks.col;j++){
                    if(Bricks.count[i][j]!==false){
                        //保存的砖块都会绘制在这里，除非有砖块被设置为false(代表他们被销毁)
                        if(Ball.x>=Bricks.x(j)&&Ball.x<=(Bricks.x(j)+Bricks.w)&&Ball.y>=Bricks.y(i)&&Ball.y<=Bricks.y(i)+Bricks.h){
                            Bricks.collide(i,j);
                            continue;
                        }

                        ctx.fillStyle = Bricks.gradient(i);
                        ctx.fillRect(Bricks.x(j),Bricks.y(i),Bricks.w,Bricks.h);
                    }
                }
            }
            if(Bricks.total===(Bricks.row*Bricks.col)){
                Game.levelUp();
            }
        },

        collide:function(i,j){
            Hub.score+=1;//每当砖块被摧毁时，就递增得分计数器
            Bricks.total+=1;//递增砖块总数，以便让游戏知道何时结束————所有砖块都摧毁了
            Bricks.count[i][j]=false;
            Ball.sy = -Ball.sy;
        },

        x:function(col){
                return (col*Bricks.w)+(col*Bricks.gap);
        },

        y:function(row){
                return (row*Bricks.h)+(row*Bricks.gap);
        },
        //自动根据砖块所属的行号，使同一行砖块的颜色形成漂亮的渐变颜色
        gradient:function(row){
            switch(row){
                //第一行：紫色
                case 0:
                    return Bricks.gradientPurple?Bricks.gradientPurple:Bricks.gradientPurple=Bricks.makeGradient(row,'#bd06f9','#9604c7');
                //第二行：红色
                case 1:
                    return Bricks.gradientRed?Bricks.gradientRed:Bricks.gradientRed=Bricks.makeGradient(row,'#f9064A','#C7043B');
                //第三行：绿色
                case 2:
                    return Bricks.gradientGreen?Bricks.gradientGreen:Bricks.gradientGreen=Bricks.makeGradient(row,'#05FA15','#04C711');
                //第四行(或序号大于四的行):橙色
                default:
                    return Bricks.gradientOrange?Bricks.gradientOrange:Bricks.gradientOrange=Bricks.makeGradient(row,'#FAA105','#C77F04');
            }
        },

        makeGradient:function(row,color1,color2){
            const y=Bricks.y(row);
            const grad = ctx.createLinearGradient(0,y,0,y+Bricks.h);
            grad.addColorStop(0,color1);//渐变起始颜色为color1
            grad.addColorStop(1,color2);//渐变终止颜色为color2

            return grad;
        }
    };
    //TODO:Ball
    const Ball={
        r:10,//用于确定小球大小的半径变量r
        init:()=>{
            //init()只包含一些如果游戏当前正在运行则需要重置的值，由于半径r这样的变量是持久性变量，所以将他们单列出来。
            Ball.x=120;
            Ball.y=120;
            //小球的速度要和当前所处关卡匹配起来
            Ball.sx=1+(0.4*Hub.lv);//sx是x轴上的速度增量
            Ball.sy=-1.5-(0.4*Hub.lv);//sy是y轴上的速度增量

        },
        draw:()=>{
            Ball.edges();
            Ball.collide();
            Ball.move();

            ctx.beginPath();
            ctx.arc(Ball.x,Ball.y,Ball.r,0,2*Math.PI);
            ctx.closePath();
            ctx.fillStyle='#eee';
            ctx.fill();
        },
        edges:()=>{
            if(Ball.y<1){//游戏容器的上边界
                Ball.y=1;
                Ball.sy=-Ball.sy;
            }else if(Ball.y>Game.height){//游戏容器的下边界
                Ball.sy = Ball.sx = 0;
                //用一些方法和对象来隐藏小球并出发游戏结束状态
                Ball.y=Ball.x = 1000;
                Screen.gameover();
                canvas.addEventListener('click',Game.restartGame,false);
                return;
            }

            if(Ball.x<1){
                Ball.x=1;
                Ball.sx = -Ball.sx;
            }else if(Ball.x>Game.width){
                Ball.x=Game.width-1;
                Ball.sx = -Ball.sx;

            }
        },

        //碰撞侦测
        collide:()=>{
            if(Ball.x>=Paddle.x&&Ball.x<=(Paddle.x+Paddle.w)&&Ball.y>=Paddle.y&&Ball.y<=(Paddle.y+Paddle.h)){
                //根据小球碰撞到球拍上的具体位置，修改小球在偏向弹回时的x坐标
                Ball.sx = 7*((Ball.x-(Paddle.x+Paddle.w/2))/Paddle.w);
                Ball.sy = -Ball.sy;
                console.log(Ball.sy);
            }
        },
        move:()=>{
            //使小球运动起来
            Ball.x+=Ball.sx;
            Ball.y+=Ball.sy;
        }
    };

    const Paddle={
        w:90,
        h:20,
        r:10,
        init:()=>{
            Paddle.x = 100;
            Paddle.y = 210;
            Paddle.speed = 4;
        },
        draw:()=>{
            Paddle.move();
            ctx.beginPath();
            ctx.moveTo(Paddle.x,Paddle.y);
            ctx.lineTo(Paddle.x+Paddle.w,Paddle.y);
            ctx.arc(Paddle.x+Paddle.w,Paddle.y+Paddle.r,Paddle.r,-Math.PI/2,Math.PI/2);
            ctx.lineTo(Paddle.x,Paddle.y+Paddle.r*2);
            ctx.arc(Paddle.x,Paddle.y+Paddle.r,Paddle.r,Math.PI/2,-Math.PI/2);
            
            ctx.closePath();

            ctx.fillStyle = Paddle.gradient();
            ctx.fill();
        },
        move:()=>{
            //球拍边界侦测
            if(Ctrl.left&&Paddle.x>-(Paddle.w/2)&&Paddle.x<Game.width-(Paddle.w/2)){
                //使球拍水平移动
                Paddle.x+=-Paddle.speed;
                console.log(Paddle.x);
            }else if(Ctrl.right&&Paddle.x>-(Paddle.w/2)&&Paddle.x<Game.width-(Paddle.w/2)){
                Paddle.x+=Paddle.speed;
            }
        },

        gradient:()=>{
            if(Paddle.gradientCache){
                return Paddle.gradientCache;
            }
            Paddle.gradientCache=ctx.createLinearGradient(Paddle.x,Paddle.y,Paddle.x,Paddle.y+20);
            Paddle.gradientCache.addColorStop(0,'#eee');
            Paddle.gradientCache.addColorStop(1,'#999');

            return Paddle.gradientCache;
        }
    };
    //实现键盘、鼠标及触摸控制
    const Ctrl={
        init:()=>{
            window.addEventListener('keydown',Ctrl.keyDown,true);
            window.addEventListener('keyup',Ctrl.keyUp,true);
            window.addEventListener('mousemove',Ctrl.movePaddle,true);

            Game.canvas.addEventListener('touchstart',Ctrl.movePaddle,false);
            Game.canvas.addEventListener('touchmove',Ctrl.movePaddle,false);
            Game.canvas.addEventListener('touchmove',Ctrl.stopTouchScroll,false);

        },
        keyDown:function(event){
            switch(event.keyCode){
                case 39://39监视玩家的右箭头键
                    Ctrl.right = true;
                    break;
                case 37://37监视玩家的左箭头键
                    Ctrl.left = true;
                    break;
                default:
                    break;
            }
        },
        //TODO:按键监听
        keyUp:function(event){//当释放按键时，keyUp将重新设置Ctrl的键盘监控
            switch(event.keyCode){
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
        movePaddle:function(event){
            let mouseX = event.pageX;
            if(event.touches){
                mouseX = event.touches[0].pageX;
            }
            let canvasX = Game.canvas.offsetLeft;

            let paddleMid = Paddle.w/2;

            if(mouseX>canvasX&&mouseX<canvasX+Game.width){
                let newX = mouseX - canvasX;
                newX-=paddleMid;
                Paddle.x = newX;
            }

        },
        stopTouchScroll:function(event){
            //触摸滚动功能在这个游戏上会造成一些问题，所以只好屏蔽掉这个触摸一定的默认功能。
            event.preventDefault();
        }
    };

    //得分与关卡输出
    const Hub = {
        init:()=>{
            Hub.lv=1;
            Hub.score=0;
        },
        draw:()=>{
            //指定文本的显示属性
            ctx.font = '12px helvetica,arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('得分:'+Hub.score,5,Game.height-5);//创建得分文本

            ctx.textAlign = 'right';
            ctx.fillText('等级:'+Hub.lv,Game.width-5,Game.height -5);//创建关卡文本
        }
    };
    //创建一个欢迎界面
    const Screen={
        welcome:()=>{
            Screen.text = '欢迎来到游戏';
            Screen.textSub = '点击游戏开始';
            Screen.textColor = 'white';

            Screen.create();
        },
        create:()=>{
            ctx.fillStyle ='black';
            ctx.fillRect(0,0,Game.width,Game.height);

            ctx.fillStyle =Screen.textColor;
            ctx.textAlign = 'center';
            ctx.font='40px helvetica,arical';
            ctx.fillText(Screen.text,Game.width/2,Game.height/2);

            ctx.fillStyle = '#999999';
            ctx.font='20px helvetica,arical';
            ctx.fillText(Screen.textSub,Game.width/2,Game.height/2+30);
        },
        gameover:()=>{
            Screen.text = '游戏结束';
            Screen.textSub = '点击重新开始';
            Screen.textColor = 'red';

            Screen.create();
        }
    };

    window.requestAnimFrame=function(callback){
            window.setTimeout(callback,1000/60);
    };
    
    //window.onload的作用是防止代码在其他所有资源完全加载前运行
    window.onload=()=>{
        Game.setup();
    };

})();