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

const dump = {};

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
            const slices = wheelData.slices;

            questionTitleElem.innerHTML = slices[this.index].text;
            modalElem.style.display = 'block';

            if (testRandomness) {
                const color = hexToRgb(slices[this.index].color);

                color.r -= 30;

                if (color.r < 0) {
                    color.r = 0;
                }

                slices[this.index].color = rgbToHex2(color.r, color.r, color.r);
                console.log(slices[this.index].color);
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
    const imagesDataKeys = Object.keys(imagesData);
    let loadedImageCount = 0;

    const onload = () => {
        console.log('image loaded');
        if (++loadedImageCount === imagesDataKeys.length) {
            console.log('all images loaded, begin...');
            begin();
        }
    }

    imagesDataKeys.forEach(key => {
        const imageObj = imagesData[key];
        console.log(`loading [${imageObj.fileName}] image...`);
        imageObj.img = new Image();
        imageObj.img.src = `./assets/${imageObj.fileName}.png`;
        imageObj.img.onload = onload
    });
}

function begin() {
    console.log('begin');
    initPhysics();
    animRequestId = window.requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    setCanvasSize();
    initPhysics();
    draw();
}, false);

document.querySelector('#spinTheWheel').addEventListener('click', () => {
    console.log('spin');
    spinning = true;
    flasher.setup();

    const speedMin = toInt(wheelData.speed.min, 10);
    const speedMax = toInt(wheelData.speed.max, 10);
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

function drawTask(params, objToDraw, taskFn) {
    context.save();
    taskFn(params, objToDraw);
    context.restore();
}

function drawSlices(params) {
    const slices = wheelData.slices;

    let sliceDegree = 360.0 / slices.length;

    context.translate(wheelBody.position.x, wheelBody.position.y);
    context.rotate(wheelBody.angle);

    for (let i = 0; i < slices.length; ++i) {
        context.fillStyle = slices[i].color;

        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, params.radius, deg2rad(sliceDegree * i), deg2rad(sliceDegree + sliceDegree * i));
        context.lineTo(0, 0);

        if (flasher.index === i) {
            context.fillStyle = flasher.update(context.fillStyle);
        }

        context.fill();
    }
}

function drawDividers(params, obj) {
    const slices = wheelData.slices;
    let sliceDegree = 360.0 / slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    applyShadowSettings(obj);

    context.lineWidth = obj.size;
    context.strokeStyle = obj.color;

    for (let i = 0; i < slices.length; ++i) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(wheelBody.position.x, wheelBody.position.y);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle * i) - sliceAngle * 0.5);

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(0, params.radius);
        context.stroke();
    }
}

function drawRodsMain(params, obj) {
    const slices = wheelData.slices;
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let sliceDegree = 360.0 / slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    applyShadowSettings(obj);

    context.lineWidth = 6;
    // context.strokeStyle = 'lightblue';
    context.fillStyle = obj.color;

    for (let i = 0; i < slices.length; ++i) {

        context.save();

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.translate(cx, cy);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle * i) - sliceAngle * 0.5);

        context.beginPath();
        context.arc(0, params.radius, 16 * obj.size, 0, Math.PI * 2);
        context.fill();
        // context.stroke();

        context.restore();

        // for (let j = 1; j <= 3; ++j) {

        //     context.save();

        //     context.lineWidth = 4;

        //     context.setTransform(1, 0, 0, 1, 0, 0);
        //     context.translate(cx, cy);
        //     context.rotate(wheelBody.angle);
        //     context.rotate((sliceAngle * i) - sliceAngle * 0.5);
        //     context.rotate(deg2rad(j * 15));

        //     context.beginPath();
        //     context.arc(0, params.radius, 8, 0, Math.PI * 2);
        //     // context.stroke();
        //     context.fill();

        //     context.restore();
        // }

    }
}

function drawRodsSub(params, obj) {
    const slices = wheelData.slices;
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let sliceDegree = 360.0 / slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    applyShadowSettings(obj);

    context.lineWidth = 6;
    // context.strokeStyle = 'lightblue';
    context.fillStyle = obj.color;

    for (let i = 0; i < slices.length; ++i) {

        for (let j = 1; j <= 3; ++j) {

            context.save();

            context.lineWidth = 4;

            applyShadowSettings(obj);

            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(cx, cy);
            context.rotate(wheelBody.angle);
            context.rotate((sliceAngle * i) - sliceAngle * 0.5);
            context.rotate(deg2rad(j * 15));

            context.beginPath();
            context.arc(0, params.radius, 8 * obj.size, 0, Math.PI * 2);
            // context.stroke();
            context.fill();

            context.restore();
        }

    }
}

function drawOuterRing(params, obj) {
    applyShadowSettings(obj);

    context.strokeStyle = obj.color;
    context.lineWidth = obj.size;
    context.beginPath();
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius, 0, -Math.PI * 2);
    context.stroke();
}

function drawInnerRing(params, obj) {
    applyShadowSettings(obj);

    context.fillStyle = obj.color;

    context.beginPath();
    context.moveTo(wheelBody.position.x, wheelBody.position.y);
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * toInt(obj.size) * 0.01, 0, Math.PI * 2);
    context.fill();
}

function drawCenter(params, obj) {
    applyShadowSettings(obj);

    context.fillStyle = obj.color;
    context.beginPath();
    context.moveTo(wheelBody.position.x, wheelBody.position.y);
    context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * toInt(obj.size) * 0.01, 0, Math.PI * 2);
    context.fill();
}

function drawText(params, obj) {
    const slices = wheelData.slices;
    let sliceDegree = 360.0 / slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    context.fillStyle = obj.color;
    // context.font = wheelData.texts.size + 'px Lobster';
    context.font = obj.size + 'px Permanent Marker';

    for (let i = 0; i < slices.length; ++i) {
        context.save();

        applyShadowSettings(obj)

        context.translate(wheelBody.position.x, wheelBody.position.y);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle - sliceAngle / 2.0) + sliceAngle * i);
        context.textBaseline = 'middle';
        context.textAlign = 'right';
        context.fillText(slices[i].text, params.radius * obj.offset * 0.001 + (params.radius / 2), 0);
        context.restore();
    }
}

function drawSlicesImages(params, obj) {
    const slices = wheelData.slices;
    let sliceDegree = 360.0 / slices.length;
    let sliceAngle = deg2rad(sliceDegree);

    for (let i = 0; i < slices.length; ++i) {
        context.save();

        applyShadowSettings(obj);

        context.translate(wheelBody.position.x, wheelBody.position.y);
        context.rotate(wheelBody.angle);
        context.rotate((sliceAngle - sliceAngle / 2.0) + sliceAngle * i);

        const image = imagesData[slices[i].icon].img;
        const size = params.radius * 0.2 * obj.size / 20;
        const xOffset = params.radius * 0.5 * obj.offset / 20;
        context.drawImage(image, xOffset - size / 2, 0 - size / 2, size, size);

        context.restore();
    }
}

function drawTongue(params, obj) {
    context.translate(tongueBody.position.x, tongueBody.position.y);
    context.rotate(tongueBody.angle);

    const scale = params.radius * 0.003;
    const w = 25 * scale;
    const arrow = -20 * scale;
    const wing = 20 * scale;
    const start = 32 * scale;

    context.beginPath();
    context.moveTo(start * scale, 0);
    context.lineTo(wing * scale, -w * scale);
    context.lineTo(arrow * scale, 0);
    context.lineTo(wing, w * scale);
    context.closePath();

    applyShadowSettings(obj);

    context.lineWidth = w * scale * 0.3;
    context.strokeStyle = obj.outline.color;
    context.stroke();

    context.shadowColor = "transparent";

    const rgbObj = hexToRgb(obj.middle.color);

    context.fillStyle = `rgba(${rgbObj.r},${rgbObj.g},${rgbObj.b}, 0.4)`;
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

function drawCenterImage(params, obj) {
    const image = imagesData.tcs.img;
    const scale = params.radius * obj.size / 10000;

    const w = image.width * scale;
    const h = image.height * scale;
    const x = wheelBody.position.x - w / 2;
    const y = wheelBody.position.y - h / 2;

    applyShadowSettings(obj);

    context.drawImage(image, x, y, w, h);
}

function getRadius() {
    return (canvas.height / 2) * 0.95;
}

function draw() {
    const params = {
        radius: getRadius(),
        slices: wheelData.slices
    };

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (drawPhysics) {
        context.globalAlpha = 0.5;
        Render.world(render);
    } else {
        context.globalAlpha = 1;
    }

    const visuals = wheelData.visuals;

    drawTask(params, null, drawSlices);
    visuals['dividers'].visible && drawTask(params, visuals.dividers, drawDividers);
    visuals['texts'].visible && drawTask(params, visuals.texts, drawText);
    visuals['slicesimages'].visible && drawTask(params, visuals.slicesimages, drawSlicesImages);
    visuals['innerRing'].visible && drawTask(params, visuals.innerRing, drawInnerRing);
    visuals['center'].visible && drawTask(params, visuals.center, drawCenter);
    visuals['outerRing'].visible && drawTask(params, visuals.outerRing, drawOuterRing);
    visuals['rods-main'].visible && drawTask(params, visuals['rods-main'], drawRodsMain);
    visuals['rods-sub'].visible && drawTask(params, visuals['rods-sub'], drawRodsSub);
    visuals['tongue'].visible && drawTask(params, visuals.tongue, drawTongue);
    visuals['centerLogo'].visible && drawTask(params, visuals.centerLogo, drawCenterImage);
    visuals['collisionCircles'].visible && drawTask(params, visuals.collisionCircles, drawDebugCollisionCircles);

    document.getElementById('dump').innerHTML = JSON.stringify(dump, null, 2);
}

function calcCollisionCircles() {
    const slices = wheelData.slices;
    const x = getRadius();
    const arr = [];

    for (let i = 0; i < slices.length; ++i) {
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
        const slices = wheelData.slices;
        const { arr, radius } = calcCollisionCircles();

        for (let i = 0; i < arr.length; ++i) {
            const inside = pointInCircle(tongueBody.position.x, tongueBody.position.y, arr[i].x, arr[i].y, radius);
            dump.pointInSideCircle = inside;
            if (inside) {
                console.log('inside [' + slices[i].text + ']');
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
    console.log('init physics...');

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

    tongueBodyWidth = ch * 0.1;
    tongueBodyHeight = ch * 0.04;

    tongueBody = Bodies.rectangle(cw * 0.9, ch / 2, tongueBodyWidth, tongueBodyHeight);
    tongueBumperBody = Bodies.rectangle(cw, ch * 0.5, ch * 0.04, ch * 0.3, { isStatic: true });

    let x = cw / 2;
    let y = ch / 2;
    let w = ch * 0.95;
    let h = w * 0.024;
    let sc = 1.75;

    const divider1 = Bodies.rectangle(x, y, w, h * sc);
    const divider11 = Bodies.rectangle(x, y, w, h);
    const divider111 = Bodies.rectangle(x, y, w, h);
    const divider1111 = Bodies.rectangle(x, y, w, h);
    const divider2 = Bodies.rectangle(x, y, w, h * sc);
    const divider22 = Bodies.rectangle(x, y, w, h);
    const divider222 = Bodies.rectangle(x, y, w, h);
    const divider2222 = Bodies.rectangle(x, y, w, h);
    const divider3 = Bodies.rectangle(x, y, w, h * sc);
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
        pointA: { x: cw * 0.94, y: ch * 0.5 },
        bodyB: tongueBody,
        pointB: { x: tongueBodyWidth / 3, y: 0 },
        length: 0,
    });

    const constraintSpring = Constraint.create({
        pointA: { x: cw, y: ch * 0.5 },
        bodyB: tongueBody,
        pointB: { x: tongueBodyWidth / 2, y: 0.01 },
        stiffness: 0.3,
        length: cw - (cw * 0.97)
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
