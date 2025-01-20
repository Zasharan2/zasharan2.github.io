// obtain canvas
var c = document.getElementById("backgroundCanvas");
var ctx = c.getContext("2d");

// adjust canvas size
c.width = window.innerWidth;
c.height = window.innerHeight;

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    dist(other) {
        return Math.sqrt(((this.x - other.x) ** 2) + ((this.y - other.y) ** 2));
    }
}

var mouseRadius = 30;
var mousePos = new Vector2(-mouseRadius, -mouseRadius);

window.addEventListener("mousemove", function(ev) {
    mousePos = new Vector2(ev.clientX - c.getBoundingClientRect().left, ev.clientY - c.getBoundingClientRect().top);
});

class Ball {
    constructor(x, y, r, col) {
        this.prevPos = new Vector2(x, y);
        this.pos = new Vector2(x, y);
        this.nextPos = new Vector2(x, y);
        this.r = r;
        this.col = col;
    }

    move() {
        this.nextPos.x = ((2 * this.pos.x) - this.prevPos.x);
        this.nextPos.y = ((2 * this.pos.y) - this.prevPos.y);

        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;

        this.pos.x = this.nextPos.x;
        this.pos.y = this.nextPos.y;
    }

    collideOther(other) {
        if (this.pos.dist(other.pos) < this.r + other.r) {
            var correct = ((this.r + other.r) - (this.pos.dist(other.pos))) / 2;
            var otherAngle = Math.atan2(other.pos.y - this.pos.y, other.pos.x - this.pos.x);
            var thisAngle = Math.atan2(this.pos.y - other.pos.y, this.pos.x - other.pos.x);

            other.pos.x += correct * Math.cos(otherAngle);
            other.pos.y += correct * Math.sin(otherAngle);
            this.pos.x += correct * Math.cos(thisAngle);
            this.pos.y += correct * Math.sin(thisAngle);
        }
    }

    collideWall() {
        if (this.pos.x + this.r > c.width) {
            this.prevPos.x = this.pos.x;
            this.pos.x = c.width - this.r;
        }
        if (this.pos.y + this.r > c.height) {
            this.prevPos.y = this.pos.y;
            this.pos.y = c.height - this.r;
        }
        if (this.pos.x - this.r < 0) {
            this.prevPos.x = this.pos.x;
            this.pos.x = this.r;
        }
        if (this.pos.y - this.r < 0) {
            this.prevPos.y = this.pos.y;
            this.pos.y = this.r;
        }
    }

    collideMouse() {
        if (this.pos.dist(mousePos) < this.r + mouseRadius) {
            var correct = ((this.r + mouseRadius) - (this.pos.dist(mousePos))) / 2;
            var thisAngle = Math.atan2(this.pos.y - mousePos.y, this.pos.x - mousePos.x);

            this.pos.x += correct * Math.cos(thisAngle);
            this.pos.y += correct * Math.sin(thisAngle);
        }
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.col;
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function sweepAndPrune() {
    var runningIntersectRegionList = [];
    var intersectRegionRight = 0;
    balls.sort((a, b) => (a.pos.x - a.r) - (b.pos.x - b.r));
    runningIntersectRegionList.push([balls[0]]);
    intersectRegionRight = balls[0].pos.x + balls[0].r;
    for (var i = 1; i < balls.length; i++) {
        if (balls[i].pos.x - balls[i].r < intersectRegionRight) {
            runningIntersectRegionList[runningIntersectRegionList.length - 1].push(balls[i]);
            if (balls[i].pos.x + balls[i].r > intersectRegionRight) {
                intersectRegionRight = balls[i].pos.x + balls[i].r;
            }
        } else {
            runningIntersectRegionList.push([balls[i]]);
            intersectRegionRight = balls[i].pos.x + balls[i].r;
        }
    }
    return runningIntersectRegionList;
}

function collideBalls() {
    var prunedList = sweepAndPrune();
    for (var i = 0; i < prunedList.length; i++) {
        for (var j = 0; j < prunedList[i].length; j++) {
            for (var k = j + 1; k < prunedList[i].length; k++) {
                prunedList[i][j].collideOther(prunedList[i][k]);
            }
        }
    }
}

function handleCollisions() {
    collideBalls();
    for (var i = 0; i < balls.length; i++) {
        balls[i].collideMouse();
        balls[i].collideWall();
    }
}

var lastUpdate = Date.now();
var myInterval = setInterval(tick, 0);

function tick() {
    var now = Date.now();
    var dt = now - lastUpdate;
    lastUpdate = now;

    update(dt);
}

var balls = [];
var randomColorWeights = [1, 1, 1]; // r g b

function createBalls() {
    for (var i = 0; i < c.width * c.height / 2500; i++) {
        balls.push(new Ball(Math.random() * c.width, Math.random() * c.height, 10 + Math.random() * 20, "rgba("+(randomColorWeights[0]*255*Math.random())+","+(randomColorWeights[1]*255*Math.random())+","+(randomColorWeights[2]*255*Math.random())+")"));
    }
}

createBalls();

// var testtimer = 0;
function update(deltaTime) {
    // update canvas even when resized
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    
    // ensure # of balls is reasonable
    while (balls.length < c.width * c.height / 2500) {
        balls.push(new Ball(Math.random() * c.width, Math.random() * c.height, 10 + Math.random() * 20, "rgba("+(randomColorWeights[0]*255*Math.random())+","+(randomColorWeights[1]*255*Math.random())+","+(randomColorWeights[2]*255*Math.random())+")"));
    }
    while (balls.length > c.width * c.height / 2500) {
        balls.pop();
    }

    handleCollisions();

    ctx.beginPath();
    ctx.fillStyle = "#220000ff";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.globalAlpha = 0.2;

    for (var i = 0; i < balls.length; i++) {
        balls[i].move();
        balls[i].render();
    }

    ctx.globalAlpha = 1;
}

var prevScrollY = 0;
window.addEventListener("scroll", function() {
    c.style.transform = "translate(0px, " + window.scrollY + "px)";
});
