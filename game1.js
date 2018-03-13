(() => {
    let ctx = null;

    const Game = {
        canvas: document.querySelector('canvas'),
        setup: () => {
            if (Game.canvas.getContext) {
                ctx = Game.canvas.getContext('2d');
                Game.width = Game.canvas.width;
                Game.height = Game.canvas.height;

                Screen.welcome();
                Game.canvas.addEventListener('click', Game.runGame, false);
                Ctrl.init();
            }
        },
        runGame: () => {
            Game.canvas.removeEventListener('click', Game.runGame, false);
            Game.init();
            Game.animate();
        },
        animate: () => {
            Game.play = requestAnimFrame(Game.animate);
            Game.draw();
        },

        init: () => {
            Background.init();
            Hub.init();
            Ball.init();
            Paddle.init();
            Bricks.init();


        },

        draw: () => {

            ctx.clearRect(0, 0, Game.width, Game.height);
            Background.draw();
            Bricks.draw();
            Paddle.draw();
            Hub.draw();
            Ball.draw();
        },
        levelUp: () => {
            Hub.lv += 1;
            Bricks.init();
            Ball.init();
            Paddle.init();
        },
        levelLimit: function (lv) {
            return lv > 5 ? 5 : lv;
        },
        restartGame: () => {
            Game.canvas.removeEventListener('click', Game.restartGame, false);
            Game.init();
        }
    };


    const Background = {
        init: () => {
            Background.ready = false;
            Background.img = new Image();
            Background.img.src = 'background.jpg';
            Background.img.onload = () => {
            Background.ready = true;
            };
        },
        draw: () => {
            if (Background.ready) {
                ctx.drawImage(Background.img, 0, 0);
            }
        }
    };

    const Bricks = {
        gap: 2,
        col: 5,
        w: 80,
        h: 15,
        init: () => {
            Bricks.row = 2 + Game.levelLimit(Hub.lv);
            Bricks.total = 0;
            Bricks.count = [Bricks.row];

            for (let i = 0; i < Bricks.row; i++) {
                Bricks.count[i] = [Bricks.col];
            }
        },
        draw: () => {
            let i, j;
            for (i = 0; i < Bricks.row; i++) {
                for (j = 0; j < Bricks.col; j++) {
                    if (Bricks.count[i][j] !== false) {

                        if (Ball.x >= Bricks.x(j) && Ball.x <= (Bricks.x(j) + Bricks.w) && Ball.y >= Bricks.y(i) && Ball.y <= Bricks.y(i) + Bricks.h) {
                            Bricks.collide(i, j);
                            continue;
                        }

                        ctx.fillStyle = Bricks.gradient(i);
                        ctx.fillRect(Bricks.x(j), Bricks.y(i), Bricks.w, Bricks.h);
                    }
                }
            }
            if (Bricks.total === (Bricks.row * Bricks.col)) {
                Game.levelUp();
            }
        },

        collide: function (i, j) {
            Hub.score += 1;
            Bricks.total += 1;
            Bricks.count[i][j] = false;
            Ball.sy = -Ball.sy;
        },

        x: function (col) {
            return (col * Bricks.w) + (col * Bricks.gap);
        },

        y: function (row) {
            return (row * Bricks.h) + (row * Bricks.gap);
        },

        gradient: function (row) {
            switch (row) {

                case 0:
                    return Bricks.gradientPurple ? Bricks.gradientPurple : Bricks.gradientPurple = Bricks.makeGradient(row, '#bd06f9', '#9604c7');

                case 1:
                    return Bricks.gradientRed ? Bricks.gradientRed : Bricks.gradientRed = Bricks.makeGradient(row, '#f9064A', '#C7043B');

                case 2:
                    return Bricks.gradientGreen ? Bricks.gradientGreen : Bricks.gradientGreen = Bricks.makeGradient(row, '#05FA15', '#04C711');

                default:
                    return Bricks.gradientOrange ? Bricks.gradientOrange : Bricks.gradientOrange = Bricks.makeGradient(row, '#FAA105', '#C77F04');
            }
        },

        makeGradient: function (row, color1, color2) {
            const y = Bricks.y(row);
            const grad = ctx.createLinearGradient(0, y, 0, y + Bricks.h);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);

            return grad;
        }
    };

    const Ball = {
        r: 10,
        init: () => {
            Ball.x = 120;
            Ball.y = 120;
            Ball.sx = 1 + (0.4 * Hub.lv);
            Ball.sy = -1.5 - (0.4 * Hub.lv);
        },
        draw: () => {
            Ball.edges();
            Ball.collide();
            Ball.move();

            ctx.beginPath();
            ctx.arc(Ball.x, Ball.y, Ball.r, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fillStyle = '#eee';
            ctx.fill();
        },
        edges: () => {
            if (Ball.y < 1) {
                Ball.y = 1;
                Ball.sy = -Ball.sy;
            } else if (Ball.y > Game.height) {
                Ball.sy = Ball.sx = 0;

                Ball.y = Ball.x = 1000;
                Screen.gameover();
                canvas.addEventListener('click', Game.restartGame, false);
                return;
            }

            if (Ball.x < 1) {
                Ball.x = 1;
                Ball.sx = -Ball.sx;
            } else if (Ball.x > Game.width) {
                Ball.x = Game.width - 1;
                Ball.sx = -Ball.sx;

            }
        },


        collide: () => {
            if (Ball.x >= Paddle.x && Ball.x <= (Paddle.x + Paddle.w) && Ball.y >= Paddle.y && Ball.y <= (Paddle.y + Paddle.h)) {

                Ball.sx = 7 * ((Ball.x - (Paddle.x + Paddle.w / 2)) / Paddle.w);
                Ball.sy = -Ball.sy;
                console.log(Ball.sy);
            }
        },
        move: () => {

            Ball.x += Ball.sx;
            Ball.y += Ball.sy;
        }
    };

    const Paddle = {
        w: 90,
        h: 20,
        r: 10,
        init: () => {
            Paddle.x = 100;
            Paddle.y = 210;
            Paddle.speed = 4;
        },
        draw: () => {
            Paddle.move();
            ctx.beginPath();
            ctx.moveTo(Paddle.x, Paddle.y);
            ctx.lineTo(Paddle.x + Paddle.w, Paddle.y);
            ctx.arc(Paddle.x + Paddle.w, Paddle.y + Paddle.r, Paddle.r, -Math.PI / 2, Math.PI / 2);
            ctx.lineTo(Paddle.x, Paddle.y + Paddle.r * 2);
            ctx.arc(Paddle.x, Paddle.y + Paddle.r, Paddle.r, Math.PI / 2, -Math.PI / 2);
            ctx.closePath();
            ctx.fillStyle = Paddle.gradient();
            ctx.fill();
        },
        move: () => {
            if (Ctrl.left && Paddle.x > -(Paddle.w / 2) && Paddle.x < Game.width - (Paddle.w / 2)) {
                Paddle.x += -Paddle.speed;
                console.log(Paddle.x);
            } else if (Ctrl.right && Paddle.x > -(Paddle.w / 2) && Paddle.x < Game.width - (Paddle.w / 2)) {
                Paddle.x += Paddle.speed;
            }
        },

        gradient: () => {
            if (Paddle.gradientCache) {
                return Paddle.gradientCache;
            }
            Paddle.gradientCache = ctx.createLinearGradient(Paddle.x, Paddle.y, Paddle.x, Paddle.y + 20);
            Paddle.gradientCache.addColorStop(0, '#eee');
            Paddle.gradientCache.addColorStop(1, '#999');

            return Paddle.gradientCache;
        }
    };

    const Ctrl = {
        init: () => {
            window.addEventListener('keydown', Ctrl.keyDown, true);
            window.addEventListener('keyup', Ctrl.keyUp, true);
            window.addEventListener('mousemove', Ctrl.movePaddle, true);

            Game.canvas.addEventListener('touchstart', Ctrl.movePaddle, false);
            Game.canvas.addEventListener('touchmove', Ctrl.movePaddle, false);
            Game.canvas.addEventListener('touchmove', Ctrl.stopTouchScroll, false);

        },
        keyDown: function (event) {
            switch (event.keyCode) {
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

        keyUp: function (event) {
            switch (event.keyCode) {
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
        movePaddle: function (event) {
            let mouseX = event.pageX;
            if (event.touches) {
                mouseX = event.touches[0].pageX;
            }
            let canvasX = Game.canvas.offsetLeft;
            let paddleMid = Paddle.w / 2;

            if (mouseX > canvasX && mouseX < canvasX + Game.width) {
                let newX = mouseX - canvasX;
                newX -= paddleMid;
                Paddle.x = newX;
            }

        },
        stopTouchScroll: function (event) {
            event.preventDefault();
        }
    };


    const Hub = {
        init: () => {
            Hub.lv = 1;
            Hub.score = 0;
        },
        draw: () => {
            ctx.font = '12px helvetica,arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('得分:' + Hub.score, 5, Game.height - 5);
            ctx.textAlign = 'right';
            ctx.fillText('等级:' + Hub.lv, Game.width - 5, Game.height - 5);
        }
    };

    const Screen = {
        welcome: () => {
            Screen.text = '欢迎来到游戏';
            Screen.textSub = '点击游戏开始';
            Screen.textColor = 'white';
            Screen.create();
        },
        create: () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, Game.width, Game.height);
            ctx.fillStyle = Screen.textColor;
            ctx.textAlign = 'center';
            ctx.font = '40px helvetica,arical';
            ctx.fillText(Screen.text, Game.width / 2, Game.height / 2);
            ctx.fillStyle = '#999999';
            ctx.font = '20px helvetica,arical';
            ctx.fillText(Screen.textSub, Game.width / 2, Game.height / 2 + 30);
        },
        gameover: () => {
            Screen.text = '游戏结束';
            Screen.textSub = '点击重新开始';
            Screen.textColor = 'red';
            Screen.create();
        }
    };

    window.requestAnimFrame = function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };


    window.onload = () => {
        Game.setup();
    };

})();