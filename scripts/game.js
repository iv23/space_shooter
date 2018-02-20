var CANVAS_HEIGHT = 320;
var CANVAS_WIDTH = 480;

var canvas=document.createElement('canvas');
canvas.id="game";
canvas.width=CANVAS_WIDTH;
canvas.height=CANVAS_HEIGHT;
canvas.style.border="1px solid #d3d3d3";

var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

var ctx=document.getElementById("game").getContext("2d");
var FPS=30;

setInterval(function () {
    update();
    draw();
},1000/FPS);

//Player object
var player={
    color:"#000",
    x:220,
    y:270,
    enemiesKilled: 0,
    enemiesMissed: 0,
    enemiesMissedLimit: 3,
    width:32,
    height:32,
    draw:function () {
        ctx.fillStyle=this.color;
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
};

player.sprite=Sprite("player");
player.draw=function () {
    this.sprite.draw(ctx,this.x,this.y);
};

//Player bullets object
var playerBullets=[];
function Bullet(I) {
    I.active=true;
    I.xVelocity=0;
    I.yVelocity=-I.speed;
    I.width=3;
    I.height=3;
    I.sprite=Sprite("bullet")
    I.color="#000";
    I.inBounds=function () {
        return I.x>=0 && I.x<=CANVAS_WIDTH &&
            I.y>=0 && I.y<=CANVAS_HEIGHT;
    };
    I.draw=function () {
        ctx.fillStyle=this.color;
        ctx.fillRect(this.x,this.y,this.width,this.height);
    };
    I.update=function () {
        I.x+=I.xVelocity;
        I.y+=I.yVelocity;
        I.active=I.active&&I.inBounds();
    };
    return I;
}

var enemies=[];
function Enemy(I) {
    I=I||{};
    I.active=true;
    I.age=Math.floor(Math.random()*12);
    I.color="#A2B";
    I.x=CANVAS_WIDTH/4+Math.random()*CANVAS_WIDTH/2;
    I.y=0;
    I.xVelocity=0;
    I.yVelocity=1;
    I.width=32;
    I.height=32;
    I.sprite=Sprite("enemy");
    I.inBounds=function () {
        return I.x>=0 && I.x<=CANVAS_WIDTH &&
            I.y>=0 && I.y<=CANVAS_HEIGHT;
    };
    I.draw=function () {
        this.sprite.draw(ctx,this.x,this.y);
    };
    I.update=function () {
        I.x=I.x.clamp(0,CANVAS_WIDTH-this.width);
        I.x+=I.xVelocity;
        I.y+=I.yVelocity;
        I.xVelocity=3*Math.sin(I.age*Math.PI/64);
        I.age++;
        I.active=I.active&&I.inBounds();
    };
    I.explode=function () {
        Sound.play("explosion");
        this.active=false;//add explosion graphic
    };
    return I;
}

function update() {
    if (keydown.left){
        player.x-=5;
    }
    if (keydown.right){
        player.x+=5;
    }
    if (keydown.space){
        player.shoot();
    }

    player.x=player.x.clamp(0,CANVAS_WIDTH-player.width);

    playerBullets.forEach(function (bullet) {
        bullet.update();
    });
    playerBullets=playerBullets.filter(function (bullet) {
        return bullet.active;
    });
    enemies.forEach(function (enemy) {
        enemy.update();
    });
    enemies=enemies.filter(function (enemy) {
        return enemy.active;
    });
    handleCollisions();
    if (Math.random()<0.02){
        enemies.push(Enemy());
    }
}

player.shoot=function () {
    Sound.play("shoot");
    var bulletPosition=this.midpoint();
    playerBullets.push(Bullet({
        speed:5,
        x:bulletPosition.x,
        y:bulletPosition.y
    }));
};
player.midpoint=function () {
    return {
        x:this.x+this.width/2,
        y:this.y
    };
};
function draw() {
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    player.draw();
    playerBullets.forEach(function (bullet) {
        bullet.draw();
    });
    enemies.forEach(function (enemy) {
        enemy.draw();
    });
}
function collides(a,b) {
    return a.x<b.x+b.width &&
        a.x+a.width>b.x &&
        a.y<b.y+b.height &&
        a.y+a.height>b.y;
}
function handleCollisions() {
    playerBullets.forEach(function (bullet) {
        enemies.forEach(function (enemy) {
            if (collides(bullet,enemy)){
                enemy.explode();
                bullet.active=false;
            }
        });
    });
    enemies.forEach(function (enemy) {
        if (collides(enemy,player)){
            enemy.explode();
            player.explode();
        }
    })
}
function handleMisses(){
    enemies.forEach(function (enemy){
        if(enemy.y>302){
            player.enemiesMissed++;
        }
    })
}
player.explode=function () {
    Sound.play("explode");
    this.active=false; 
};
