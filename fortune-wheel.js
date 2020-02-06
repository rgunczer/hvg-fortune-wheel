let canvas = null;
let context = null;

const modalElem = document.querySelector('#question-modal');
const questionTitleElem = document.querySelector('#question-title');
const questionTextElem = document.querySelector('#question-text');

modalElem.addEventListener('click', () => {
    modalElem.style.display = 'none';
    questionTextElem.innerHTML = 'What do you get when you cross a mentally ill loner with a society that abandons him and treats him like trash?';
});

// matter vars
const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Constraint = Matter.Constraint;
const Composites = Matter.Composites;
const Composite = Matter.Composite;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

let engine = null;
let tongueBody = null;
let wheelBody = null;
let spinning = false;
let drawPhysics = false;
let testRandomness = false;

const wheelSpeed = {
    min: 30,
    max: 70
};

const dump = {};

const drawFlags = {
    slices: true,
    dividers: true,
    subDividers: true,
    texts: true,
    slicesimages: true,
    innerRing: true,
    center: true,
    outerRing: true,
    tongue: true,
    collisionCircles: false,
};

const flasher = {
    index: -1,
    counter: 0,
    fill: true,

    setup(index = -1) {
        this.index = index;
        this.counter = 0
        this.next = this.cooldown - this.nextStep;
    },

    update(fillStyle) {
        this.counter++;

        if (this.counter > wheelData.flashing.time) {
            questionTitleElem.innerHTML = wheelData.slices[this.index].text;
            modalElem.style.display = 'block';

            if (testRandomness) {
                const color = hexToRgb(wheelData.slices[this.index].color);

                color.r -= 30;

                if (color.r < 0) {
                    color.r = 0;
                }

                wheelData.slices[this.index].color = rgbToHex2(color.r, color.r, color.r);
                console.log(wheelData.slices[this.index].color);
            }

            this.setup();

            return fillStyle;
        } else {
            if (this.counter % 9 === 0) {
                this.fill = !this.fill;
            }
            if (this.fill) {
                return wheelData.flashing.color
            } else {
                return fillStyle;
            }
        }
    }
};

const wheelData = {
    "flashing": { "color": "#ffff00", "time": 100 },
    "dividers": { "color": "#004080", "size": "7" },
    "text": { "color": "#c7c4ee", "size": "60", "offset": "458" },
    "slicesimages": { "size": "30", "offset": "20" },
    "center": { "color": "#7d7dff", "size": "28" },
    "innerRing": { "color": "#7054b8", "size": "28" },
    "outerRing": { "color": "#5a349a", "size": 30 },
    "slices": [
        { "color": "#918bc5", "text": "Life", "icon": "life" },
        { "color": "#7557cc", "text": "Internship", "icon": "internship" },
        { "color": "#a06bd1", "text": "Corporate", "icon": "corporate" },
        { "color": "#73719d", "text": "Finance", "icon": "finance" },
        { "color": "#4f59b9", "text": "IT Service Desk", "icon": "itservicedesk" },
        { "color": "#6872b0", "text": "IT Services", "icon": "itservices" },
    ]
};

// apply TCS colors
wheelData.slices[0].color = rgbObjToHex(TCSColors.DarkRed);
wheelData.slices[1].color = rgbObjToHex(TCSColors.LightPurple);
wheelData.slices[2].color = rgbObjToHex(TCSColors.MediumPurple);
wheelData.slices[3].color = rgbObjToHex(TCSColors.DarkOrange);
wheelData.slices[4].color = rgbObjToHex(TCSColors.DarkPurple);
wheelData.slices[5].color = rgbObjToHex(TCSColors.DarkBlue);

if (testRandomness) {
    wheelData.slices.forEach(slice => {
        slice.color = rgbToHex2(255, 255, 255);
    });
}

function setCanvasSize() {
    const h = window.innerHeight; // * 0.75;

    canvas.width = h * 1.2;
    canvas.height = h;

    canvas.style.left = (window.innerWidth / 2 - canvas.width / 2) + 'px';
    canvas.style.top = (window.innerHeight / 2 - canvas.height / 2) + 'px';
}

function loadImages() {
    const keys = Object.keys(imageData);
    let count = 0;

    const onload = () => {
        console.log('image loaded...');
        if (++count === keys.length) {
            initPhysics();
            animRequestId = window.requestAnimationFrame(animate);
        }
    }

    keys.forEach(key => {
        console.log(`loading [${imageData[key].fileName}] ...`);
        imageData[key].img = new Image();
        imageData[key].img.src = `./assets/${imageData[key].fileName}.png`;
        imageData[key].img.onload = onload
    });
}

window.addEventListener('resize', () => {
    setCanvasSize();
    draw();
}, false);

document.querySelector('#spinTheWheel').addEventListener('click', () => {
    console.log('spin');
    spinning = true;
    flasher.setup();

    const speedMin = parseInt(wheelSpeed.min, 10);
    const speedMax = parseInt(wheelSpeed.max, 10);
    const velocity = getRandom(speedMin, speedMax);
    dump.min = speedMin;
    dump.max = speedMax;
    dump.velocity = velocity;

    // Body.setAngularVelocity(wheelBody, Math.PI / velocity);
    wheelBody.torque = velocity * 1000;
});

document.querySelector('#stopTheWheel').addEventListener('click', () => {
    console.log('stop');
    spinning = false;
    flasher.setup();
    Body.setAngularVelocity(wheelBody, 0);
});

document.querySelector('#justATest').addEventListener('click', () => {
    modalElem.style.display = 'block';
    showRandomQuestion();
});

document.querySelector('#renderMatter').addEventListener('click', () => {
    drawPhysics = !drawPhysics;
});

(function init() {

    setTimeout(() => {
        console.log('init')
        canvas = document.querySelector('#fortune-wheel-canvas');
        context = canvas.getContext("2d");

        setCanvasSize();
        loadImages();
    });

})();

function animate() {
    Engine.update(engine);
    checkSelectedSliceAfterSpinning();
    draw();
    window.requestAnimationFrame(animate);
}

function drawTask(params, taskFn) {
    context.save();
    taskFn(params);
    context.restore();
}

function drawSlices(params) {
    let sliceDegree = 360.0 / wheelData.slices.length;

    context.translate(wheelBody.position.x, wheelBody.position.y);
    context.rotate(wheelBody.angle);

    for (let i = 0; i < wheelData.slices.length; ++i) {
        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, params.radius, deg2rad(sliceDegree * i), deg2rad(sliceDegree + sliceDegree * i));
        context.lineTo(0, 0);
        context.fillStyle = wheelData.slices[i].color;

        if (flasher.index === i) {
            context.fillStyle = flasher.update(context.fillStyle);
        }

        context.fill();
    }
}

function drawDividers(params) {
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let sliceDegree = 360.0 / wheelData.slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    context.shadowColor = 'black';
    context.shadowBlur = 20;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.lineWidth = wheelData.dividers.size;
    context.strokeStyle = wheelData.dividers.color;

    for (let i = 0; i < wheelData.slices.length; ++i) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(cx, cy);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle * i) - sliceAngle * 0.5);

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0, params.radius);
        context.stroke();
    }
}

function drawSubDividers(params) {
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let sliceDegree = 360.0 / wheelData.slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    context.shadowColor = 'black';
    context.shadowBlur = 14;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.lineWidth = 6;
    // context.strokeStyle = 'lightblue';
    context.fillStyle = 'lightblue';

    for (let i = 0; i < wheelData.slices.length; ++i) {

        context.save();

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(cx, cy);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle * i) - sliceAngle * 0.5);

        context.beginPath();
        context.arc(0, params.radius, 16, 0, Math.PI * 2);
        context.fill();
        context.stroke();

        context.restore();

        for (let j = 1; j <= 3; ++j) {

            context.save();

            context.lineWidth = 4;

            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(cx, cy);
            context.rotate(wheelBody.angle);
            context.rotate((sliceAngle * i) - sliceAngle * 0.5);
            context.rotate(deg2rad(j * 15));

            context.beginPath();
            context.arc(0, params.radius, 8, 0, Math.PI * 2);
            // context.stroke();
            context.fill();

            context.restore();
        }

    }
}

function drawOuterRing(params) {
    context.shadowColor = 'black';
    context.shadowBlur = 20;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.strokeStyle = wheelData.outerRing.color;
    context.lineWidth = wheelData.outerRing.size;
    context.beginPath();
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius, 0, -Math.PI * 2);
    context.stroke();
}

function drawInnerRing(params) {
    context.shadowColor = 'black';
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.fillStyle = wheelData.innerRing.color;
    context.beginPath();

    context.moveTo(wheelBody.position.x, wheelBody.position.y);
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * parseInt(wheelData.innerRing.size) * 0.01, 0, Math.PI * 2);
    context.fill();
}

function drawCenter(params) {
    const wh = params.radius * 0.25;

    context.fillStyle = wheelData.center.color;
    context.beginPath();
    context.moveTo(wheelBody.position.x, wheelBody.position.y);
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * parseInt(wheelData.center.size) * 0.01, 0, Math.PI * 2);
    context.fill();
}

function drawText(params) {
    let sliceDegree = 360.0 / wheelData.slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    context.fillStyle = wheelData.text.color;
    context.font = wheelData.text.size + 'px Lobster';
    // context.font = wheelData.text.size + 'px Permanent Marker';

    const x = wheelBody.position.x;
    const y = wheelBody.position.y;

    for (let i = 0; i < wheelData.slices.length; ++i) {
        context.save();

        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.translate(x, y);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle - sliceAngle / 2.0) + sliceAngle * i);
        context.textBaseline = 'middle';
        context.fillText(wheelData.slices[i].text, params.radius * wheelData.text.offset * 0.001, 0);

        context.restore();
    }
}

function drawSlicesImages(params) {
    let sliceDegree = 360.0 / wheelData.slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    const x = wheelBody.position.x;
    const y = wheelBody.position.y;

    for (let i = 0; i < wheelData.slices.length; ++i) {
        context.save();

        context.shadowColor = 'black';
        context.shadowBlur = 30;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        context.translate(x, y);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle - sliceAngle / 2.0) + sliceAngle * i);

        const image = imageData[wheelData.slices[i].icon].img;
        const size = params.radius * 0.2 * wheelData.slicesimages.size / 20;
        const xOffset = params.radius * 0.5 * wheelData.slicesimages.offset / 20;
        context.drawImage(image, xOffset - size / 2, 0 - size / 2, size, size);

        context.restore();
    }
}

function drawTongue(params) {
    context.translate(tongueBody.position.x, tongueBody.position.y);
    context.rotate(tongueBody.angle);

    const scale = params.radius * 0.003;
    const w = 30 * scale;
    const arrow = -40 * scale;
    const wing = 10 * scale;
    const start = 20 * scale;

    context.beginPath();
    context.moveTo(start * scale, 0);
    context.lineTo(wing * scale, -w * scale);
    context.lineTo(arrow * scale, 0);
    context.lineTo(wing, w * scale);
    context.closePath();

    context.shadowColor = 'black';
    context.shadowBlur = 15;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.lineWidth = 9;
    context.strokeStyle = 'lightblue';
    context.stroke();

    context.shadowColor = "transparent";

    context.fillStyle = 'rgba(222,222,222, 0.4)';
    context.fill();
}

function drawDebugCollisionCircles(params) {
    const { arr, radius } = calcCollisionCircles();

    for (let i = 0; i < arr.length; ++i) {
        context.beginPath();
        context.arc(arr[i].x, arr[i].y, radius, 0, 2 * Math.PI);
        context.stroke();
    }

    // const { min, max } = tongueBody.bounds;
    // const x = max.x - min.x;
    // const y = max.y - min.y;

    context.beginPath();
    context.arc(tongueBody.position.x, tongueBody.position.y, params.radius * 0.02, 0, 2 * Math.PI);
    context.stroke();
}

function drawCenterImage(params) {
    const image = imageData.tcs.img;
    const scale = params.radius * 0.0009;

    const w = image.width * scale;
    const h = image.height * scale;
    const x = wheelBody.position.x - w / 2;
    const y = wheelBody.position.y - h / 2;

    context.drawImage(image, x, y, w, h);
}

function getRadius() {
    return (canvas.height / 2) * 0.95;
}

function draw() {
    const params = {
        radius: getRadius()
    };

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (drawPhysics) {
        context.globalAlpha = 0.6;
        Render.world(render);
    } else {
        context.globalAlpha = 1;
    }

    drawFlags.slices && drawTask(params, drawSlices);
    drawFlags.dividers && drawTask(params, drawDividers);
    drawFlags.texts && drawTask(params, drawText);
    drawFlags.slicesimages && drawTask(params, drawSlicesImages);
    drawFlags.innerRing && drawTask(params, drawInnerRing);
    drawFlags.center && drawTask(params, drawCenter);
    drawFlags.outerRing && drawTask(params, drawOuterRing);
    drawFlags.subDividers && drawTask(params, drawSubDividers);
    drawFlags.tongue && drawTask(params, drawTongue);
    drawTask(params, drawCenterImage);
    drawFlags.collisionCircles && drawTask(params, drawDebugCollisionCircles);

    document.getElementById('dump').innerHTML = JSON.stringify(dump, null, 2);
}

function calcCollisionCircles() {
    const x = getRadius();
    const arr = [];

    for (let i = 0; i < wheelData.slices.length; ++i) {
        const newPos = rotatePointCenter(x, 0, rad2deg(wheelBody.angle) + 30 + i * 60);

        arr.push(newPos);

        newPos.x += wheelBody.position.x;
        newPos.y += wheelBody.position.y;
    }

    return {
        radius: x * 0.5,
        arr,
    };
}

function checkSelectedSliceAfterSpinning() {
    if (spinning && wheelBody.angularSpeed < 0.001 && tongueBody.angularSpeed < 0.001) {

        const { arr, radius } = calcCollisionCircles();

        for (let i = 0; i < arr.length; ++i) {
            const inside = pointInCircle(tongueBody.position.x, tongueBody.position.y, arr[i].x, arr[i].y, radius);
            dump.pointInSideCircle = inside;
            if (inside) {
                console.log('inside [' + wheelData.slices[i].text + ']');
                spinning = false;
                flasher.setup(i);
                break;
            }
        }
    }

    dump.spinning = spinning;
    dump.wheelSpeed = wheelBody.angularSpeed;
    dump.tongueSpeed = tongueBody.angularSpeed;
    dump.torque = wheelBody.torque;
}

function initPhysics() {
    const cw = canvas.width;
    const ch = canvas.height;

    if (engine) {
        Engine.clear(engine);
        engine = null;
    }

    engine = Engine.create();
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: cw,
            height: ch,
            wireframes: true,
            showDebug: true,
            showAxes: true,
            showPositions: true,
            showIds: true,
        }
    });

    // engine.world.gravity.y = 0;

    tongueBody = Bodies.rectangle(cw * 0.9, ch / 2, ch * 0.1, ch * 0.04);
    tongueBumperBody = Bodies.rectangle(cw, ch * 0.5, ch * 0.04, ch * 0.3, { isStatic: true });

    let x = cw / 2;
    let y = ch / 2;
    let w = ch * 0.93;
    let h = w * 0.024;

    const divider1 = Bodies.rectangle(x, y, w, h);
    const divider11 = Bodies.rectangle(x, y, w, h);
    const divider111 = Bodies.rectangle(x, y, w, h);
    const divider1111 = Bodies.rectangle(x, y, w, h);
    const divider2 = Bodies.rectangle(x, y, w, h);
    const divider22 = Bodies.rectangle(x, y, w, h);
    const divider222 = Bodies.rectangle(x, y, w, h);
    const divider2222 = Bodies.rectangle(x, y, w, h);
    const divider3 = Bodies.rectangle(x, y, w, h);
    const divider33 = Bodies.rectangle(x, y, w, h);
    const divider333 = Bodies.rectangle(x, y, w, h);
    const divider3333 = Bodies.rectangle(x, y, w, h);

    let degrees = 0;
    Body.setAngle(divider1, deg2rad(degrees));

    degrees += 15
    Body.setAngle(divider11, deg2rad(degrees));

    degrees += 15
    Body.setAngle(divider111, deg2rad(degrees));

    degrees += 15
    Body.setAngle(divider1111, deg2rad(degrees));


    degrees += 15;
    Body.setAngle(divider2, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider22, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider222, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider2222, deg2rad(degrees));


    degrees += 15;
    Body.setAngle(divider3, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider33, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider333, deg2rad(degrees));

    degrees += 15;
    Body.setAngle(divider3333, deg2rad(degrees));

    wheelBody = Body.create({
        parts: [
            divider1, divider11, divider111, divider1111,
            divider2, divider22, divider222, divider2222,
            divider3, divider33, divider333, divider3333
        ]
    });

    const constraintWheel = Constraint.create({
        pointA: { x: cw / 2, y: ch / 2 },
        bodyB: wheelBody,
        length: 0
    })

    const constraintTongue = Constraint.create({
        pointA: { x: cw * 0.95, y: ch * 0.5 },
        bodyB: tongueBody,
        pointB: { x: 40, y: 0 },
        length: 0,
    });

    const constraintSpring = Constraint.create({
        pointA: { x: cw, y: ch * 0.5 },
        bodyB: tongueBody,
        pointB: { x: 50, y: 0 },
        stiffness: 0.18,
        length: 20
    })

    World.add(engine.world, [
        tongueBody,
        tongueBumperBody,
        wheelBody,
        constraintTongue,
        constraintSpring,
        constraintWheel,
    ]);

    engine.world.positionIterations = 20;
    engine.world.velocityIterations = 20;

}

// QUESTIONS
var lastQuestionNumber = 6;
var addQuestionButton = document.getElementById('addQuestion');

function addQuestion() {
    lastQuestionNumber++;

    var div = document.createElement('div');
    div.setAttribute('class', 'input');
    document.getElementById('questions').appendChild(div);

    var label = document.createElement('label');
    label.setAttribute('for', 'q' + lastQuestionNumber);
    label.innerHTML = 'Text: ';
    div.appendChild(label);

    var input = document.createElement('input');
    input.name = 'q' + lastQuestionNumber;
    input.id = 'q' + lastQuestionNumber;
    input.value = 'test question ' + lastQuestionNumber;
    div.appendChild(input);
}

addQuestionButton.addEventListener('click', () => {
    addQuestion();
});

function showRandomQuestion() {
    var rndNum = getRndInteger(1, lastQuestionNumber);
    var questionText = document.querySelector('#q' + rndNum).value;

    questionTextElem.innerHTML = questionText; // + '    ' + Date.now();
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// setTimeout(() => {
//     modalElem.style.display = 'block';
// }, 4000);
