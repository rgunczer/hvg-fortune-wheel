let canvas = null;
let context = null;

const modalElem = document.querySelector('#question-modal');
const questionTitleElem = document.querySelector('#question-title');
const questionTextElem = document.querySelector('#question-text');

modalElem.addEventListener('click', () => {
    modalElem.style.display = 'none';
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

const drawFlags = {
    slices: true,
    dividers: true,
    texts: true,
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

const imageData = {
    tcs: {
        fileName: 'tcs-logo',
    },
    tata: {
        fileName: 'tcs-tata',
    }
};

const wheelData = {
    "flashing": { "color": "#ffff00", "time": 100 },
    "dividers": { "color": "#004080", "size": "7" },
    "text": { "color": "#c7c4ee", "size": "60", "offsetFromCenter": "458" },
    "center": { "color": "#7d7dff", "size": "12" },
    "innerRing": { "color": "#7054b8", "size": "13" },
    "outerRing": { "color": "#5a349a", "size": 17 },
    "slices": [{ "color": "#918bc5", "text": "Sekiro" }, { "color": "#a06bd1", "text": "Nioh" }, { "color": "#4f59b9", "text": "RDR2" }, { "color": "#73719d", "text": "FarCry" }, { "color": "#6872b0", "text": "Doom" }, { "color": "#7557cc", "text": "Yakuza" }]
};

function setCanvasSize() {
    canvas.width = window.innerHeight * 1.2;
    canvas.height = window.innerHeight;

    canvas.style.left = (window.innerWidth / 2 - canvas.width / 2) + 'px';
}

function loadImages() {
    const keys = Object.keys(imageData);
    let count = 0;

    const onload = () => {
        console.log('images loaded...');
        if (++count === keys.length) {
            initPhysics();
            animRequestId = window.requestAnimationFrame(animate);
        }
    }

    keys.forEach(key => {
        console.log(imageData[key].fileName)
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

    const velocity = Math.PI / getRandom(6, 6 * 3);

    Body.setAngularVelocity(wheelBody, velocity);
});

document.querySelector('#stopTheWheel').addEventListener('click', () => {
    console.log('stop');
    spinning = false;
    flasher.setup();
    Body.setAngularVelocity(wheelBody, 0);

});

document.querySelector('#justATest').addEventListener('click', () => {
    modalElem.style.display = 'block';
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
        context.fillText(wheelData.slices[i].text, params.radius * wheelData.text.offsetFromCenter * 0.001, 0);

        context.drawImage(imageData.tcs.img, 200, 0, 120, 120);

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
    const arr = calcCollisionCircles();

    for (let i = 0; i < arr.length; ++i) {
        context.beginPath();
        context.arc(arr[i].x, arr[i].y, params.radius * 0.46, 0, 2 * Math.PI);
        context.stroke();
    }

    context.beginPath();
    context.arc(wheelBody.position.x + params.radius * 0.9, wheelBody.position.y, 10, 0, 2 * Math.PI);
    context.stroke();
}

function drawCenterImage(params) {
    const image = imageData.tata.img;
    const scale = params.radius * 0.0003;

    const w = image.width * scale;
    const h = image.height * scale;
    const x = wheelBody.position.x - w / 2;
    const y = wheelBody.position.y - h / 2;

    context.drawImage(image, x, y, w, h);
}

function draw() {
    const params = {
        radius: (canvas.height / 2) * 0.95
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
    drawFlags.innerRing && drawTask(params, drawInnerRing);
    drawFlags.center && drawTask(params, drawCenter);
    drawFlags.outerRing && drawTask(params, drawOuterRing);
    drawFlags.tongue && drawTask(params, drawTongue);
    drawTask(params, drawCenterImage);
    drawFlags.collisionCircles && drawTask(params, drawDebugCollisionCircles);
}

function calcCollisionCircles() {
    let radius = (canvas.height / 2) * 0.91;
    const arr = [];

    for (let i = 0; i < wheelData.slices.length; ++i) {
        const newPos = rotatePointCenter(radius, 0, rad2deg(wheelBody.angle) + 30 + i * 60);

        arr.push(newPos);

        newPos.x += wheelBody.position.x;
        newPos.y += wheelBody.position.y;
    }

    return arr;
}

function checkSelectedSliceAfterSpinning() {
    if (spinning && wheelBody.angularSpeed < 0.001 && tongueBody.angularSpeed < 0.001) {
        const radius = (canvas.height / 2) * 0.95;
        const arr = calcCollisionCircles();

        for (let i = 0; i < arr.length; ++i) {
            const tip = {
                x: wheelBody.position.x + radius,
                y: wheelBody.position.y
            }

            const inside = pointInCircle(tip.x, tip.y, arr[i].x, arr[i].y, 170);

            if (inside) {
                console.log('inside [' + wheelData.slices[i].text + ']');
                spinning = false;
                flasher.setup(i);
            }
        }
    }
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
    const divider2 = Bodies.rectangle(x, y, w, h);
    const divider3 = Bodies.rectangle(x, y, w, h);

    let degrees = 0;
    Body.setAngle(divider1, deg2rad(degrees));

    degrees += 60;
    Body.setAngle(divider2, deg2rad(degrees));

    degrees += 60;
    Body.setAngle(divider3, deg2rad(degrees));

    wheelBody = Body.create({
        parts: [divider1, divider2, divider3]
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
}


// setTimeout(() => {
//     modalElem.style.display = 'block';
// }, 4000);
