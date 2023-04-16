var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

rectRenderSlow = 15;

class Rect {
    constructor(x, y, w, h, col) {
        this.pos = new Vector2(x, y);
        this.renderPos = new Vector2(x, y);
        this.size = new Vector2(w, h);
        this.col = col;
    }

    update() {
        this.renderPos.x += (this.pos.x - this.renderPos.x) / rectRenderSlow;
        this.renderPos.y += (this.pos.y - this.renderPos.y) / rectRenderSlow;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.col;
        ctx.fillRect(this.renderPos.x, this.renderPos.y, this.size.x, this.size.y);
    }
}

class Circle {
    constructor(x, y, r, col) {
        this.pos = new Vector2(x, y);
        this.r = r;
        this.col = col;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.col;
        ctx.ellipse(this.pos.x, this.pos.y, this.r, this.r, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}

unit = 512 / 13;

backgroundRect = new Rect(0, 0, 512, 512, "#ffccff");

moveCircles = [new Circle(4.5 * unit, 256 - (2 * unit), unit / 2, "#ff6666"),
               new Circle(6.5 * unit, 256 + (2 * unit), unit / 2, "#66ff44"),
               new Circle(8.5 * unit, 256 - (2 * unit), unit / 2, "#6666ff")];


var rubiks = [new Rect(1 * unit, 256 - (unit / 2), unit, unit, "#ff0000"),
              new Rect(3 * unit, 256 - (unit / 2), unit, unit, "#ff8800"),
              new Rect(5 * unit, 256 - (unit / 2), unit, unit, "#ffff00"),
              new Rect(7 * unit, 256 - (unit / 2), unit, unit, "#00ff00"),
              new Rect(9 * unit, 256 - (unit / 2), unit, unit, "#0000ff"),
              new Rect(11 * unit, 256 - (unit / 2), unit, unit, "#ff00ff")];


var order = [rubiks.filter(rubik => {return rubik.col == "#ff0000"})[0], rubiks.filter(rubik => {return rubik.col == "#ff8800"})[0], rubiks.filter(rubik => {return rubik.col == "#ffff00"})[0], rubiks.filter(rubik => {return rubik.col == "#00ff00"})[0], rubiks.filter(rubik => {return rubik.col == "#0000ff"})[0], rubiks.filter(rubik => {return rubik.col == "#ff00ff"})[0]]

var scrambleCircle = new Circle(6.5 * unit, 256 - (5 * unit), unit, "#ffffff");

var labelCircle = new Circle(unit, unit, (unit / 2), "#ffffff");
var labels = false;

var circleSlow = 10;

var timer = 0;
var delay = 40;

function setRubiks(state) {
    for (var k = 0; k < rubiks.length; k++) {
        rubiks[k] = order[(state[k] - 1)];
        rubiks[k].pos.x = ((k * 2) + 1) * unit;
    }
}

function scramble() {
    var temp = [1, 2, 3, 4, 5, 6];
    while (JSON.stringify(temp) == JSON.stringify([1, 2, 3, 4, 5, 6])) {
        temp = [1, 2, 3, 4, 5, 6].sort(() => (Math.random() > 0.5) ? 1 : -1);
    }
    setRubiks(temp);
}

colList = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0000ff", "#ff00ff"];

function makeMove(move) {
    switch (move) {
        case 0: {
            var temp = [rubiks[0], rubiks[1], rubiks[2], rubiks[3]]
            for (var j = 0; j < 4; j++) {
                rubiks[j] = temp[3 - j];
                rubiks[j].pos.x = ((j * 2) + 1) * unit;
            }
            break;
        }
        case 1: {
            var temp = [rubiks[1], rubiks[2], rubiks[3], rubiks[4]]
            for (var j = 0; j < 4; j++) {
                rubiks[j + 1] = temp[3 - j];
                rubiks[j + 1].pos.x = (((j + 1) * 2) + 1) * unit;
            }
            break;
        }
        case 2: {
            var temp = [rubiks[2], rubiks[3], rubiks[4], rubiks[5]]
            for (var j = 0; j < 4; j++) {
                rubiks[j + 2] = temp[3 - j];
                rubiks[j + 2].pos.x = (((j + 2) * 2) + 1) * unit;
            }
            break;
        }
        default: {
            break;
        }
    }
}

function main() {
    timer += deltaTime;

    backgroundRect.render();

    for (var i = 0; i < rubiks.length; i++) {
        rubiks[i].update();
        rubiks[i].render();

        if (labels) {
            ctx.beginPath();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(rubiks[i].renderPos.x + (unit / 4), rubiks[i].renderPos.y + (unit / 4), (unit / 2), (unit / 2));
            ctx.fillStyle = "#000000";
            ctx.font = "20px Comic Sans MS";
            ctx.fillText(1 + colList.findIndex(x => x == rubiks[i].col), rubiks[i].renderPos.x + (unit / 2) - 6, rubiks[i].renderPos.y + (unit / 2) + 7);
        }
    }

    for (var i = 0; i < moveCircles.length; i++) {
        moveCircles[i].render();
        if (Math.sqrt(Math.pow(mouseX - moveCircles[i].pos.x, 2) + Math.pow(mouseY - moveCircles[i].pos.y, 2)) <= (5 + (unit / 2))) {
            if (mouseDown && timer > delay) {
                makeMove(i);
                console.log(i);
                timer = 0;
            }
            moveCircles[i].r += (((5 + (unit / 2)) - moveCircles[i].r) / circleSlow) * deltaTime;
        } else {
            moveCircles[i].r += ((((unit / 2)) - moveCircles[i].r) / circleSlow) * deltaTime;
        }
    }

    scrambleCircle.render();
    if (Math.sqrt(Math.pow(mouseX - scrambleCircle.pos.x, 2) + Math.pow(mouseY - scrambleCircle.pos.y, 2)) <= (10 + (unit))) {
        if (mouseDown && timer > delay) {
            scramble();
            timer = 0;
        }
        scrambleCircle.r += (((10 + (unit)) - scrambleCircle.r) / circleSlow) * deltaTime;
    } else {
        scrambleCircle.r += ((((unit)) - scrambleCircle.r) / circleSlow) * deltaTime;
    }

    labelCircle.render();
    if (Math.sqrt(Math.pow(mouseX - labelCircle.pos.x, 2) + Math.pow(mouseY - labelCircle.pos.y, 2)) <= (5 + (unit / 2))) {
        if (mouseDown && timer > delay) {
            if (labels) {
                labels = false;
            } else {
                labels = true;
            }
            timer = 0;
        }
        labelCircle.r += (((5 + (unit / 2)) - labelCircle.r) / circleSlow) * deltaTime;
    } else {
        labelCircle.r += ((((unit / 2)) - labelCircle.r) / circleSlow) * deltaTime;
    }
}

var deltaTime = 0;
var deltaCorrect = (1 / 8);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);