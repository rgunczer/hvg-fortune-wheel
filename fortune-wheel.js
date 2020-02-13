'use strict';

function fortuneWheel(options, canvas) {

    const TWO_PI = Math.PI * 2;

    // matterjs
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Constraint = Matter.Constraint;
    const Composites = Matter.Composites;
    const Composite = Matter.Composite;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;

    let engine = null;
    let render = null;
    let tongueBody = null;
    let wheelBody = null;
    let spinning = false;
    let drawPhysics = false;
    let testRandomness = false;
    const context = canvas.getContext('2d');

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

            if (this.counter > options['flashing-time'].value) {
                const slices = options.slices;

                showRandomQuestion(slices[this.index].text);

                if (testRandomness) {
                    const color = hexToRgb(slices[this.index].color);

                    color.r -= 30;

                    if (color.r < 0) {
                        color.r = 0;
                    }

                    slices[this.index].color = rgbToHex2(color.r, color.r, color.r);
                }

                this.setup();

                return fillStyle;
            } else {
                if (this.counter % 9 === 0) {
                    this.fill = !this.fill;
                }
                if (this.fill) {
                    return options['flashing-color']
                } else {
                    return fillStyle;
                }
            }
        }
    };

    function drawTask(params, objToDraw, taskFn) {
        if (objToDraw.visible) {
            context.save();
            taskFn(params, objToDraw);
            context.restore();
        }
    }

    function drawSlices(params) {
        const { sliceAngle, slices, radius, cx, cy, angle } = params;

        context.translate(cx, cy);
        context.rotate(angle);

        for (let i = 0; i < slices.length; ++i) {
            context.fillStyle = slices[i].color;

            context.beginPath();
            context.arc(0, 0, radius, (sliceAngle * i), sliceAngle + (sliceAngle * i));
            context.lineTo(0, 0);

            if (flasher.index === i) {
                context.fillStyle = flasher.update(context.fillStyle);
            }

            if (options.slices[i].visible) {
                context.fill();
            }
        }
    }

    function drawDividers(params, obj) {
        const { slices, radius, sliceAngle, cx, cy, angle } = params;

        applyShadowSettings(obj);

        context.lineWidth = obj.scale;
        context.strokeStyle = obj.color;

        for (let i = 0; i < slices.length; ++i) {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.translate(cx, cy);
            context.rotate(angle + (sliceAngle * i) - sliceAngle * 0.5);

            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(0, radius);
            context.stroke();
        }
    }

    function drawRodsMain(params, obj) {
        applyShadowSettings(obj);

        context.fillStyle = obj.color;

        context.translate(wheelBody.position.x, wheelBody.position.y);
        context.rotate(wheelBody.angle);

        for (let i = 0; i < params.slices.length; ++i) {
            context.save();

            context.rotate((params.sliceAngle * i) - params.sliceAngle * 0.5);

            context.beginPath();
            context.arc(0, params.radius, params.radius * 0.035 * obj.scale * 0.05, 0, TWO_PI);
            context.fill();

            context.restore();
        }
    }

    function drawRodsSub(params, obj) {
        applyShadowSettings(obj);

        context.fillStyle = obj.color;

        for (let i = 0; i < params.slices.length; ++i) {

            for (let j = 1; j <= 1; ++j) {
                context.save();

                applyShadowSettings(obj);

                context.translate(wheelBody.position.x, wheelBody.position.y);
                context.rotate(wheelBody.angle);
                context.rotate((params.sliceAngle * i) - params.sliceAngle * 0.5);
                context.rotate(deg2rad(j * 30));

                context.beginPath();
                context.arc(0, params.radius, params.radius * 0.02 * obj.scale * 0.05, 0, TWO_PI);
                context.fill();

                context.restore();
            }

        }
    }

    function drawOuterRing(params, obj) {
        applyShadowSettings(obj);

        context.strokeStyle = obj.color;
        context.lineWidth = params.radius * obj.scale * 0.003;
        context.beginPath();
        context.arc(wheelBody.position.x, wheelBody.position.y, params.radius, 0, TWO_PI);
        context.stroke();
    }

    function drawInnerRing(params, obj) {
        applyShadowSettings(obj);

        context.strokeStyle = obj.color;
        context.lineWidth = obj.scale;

        context.beginPath();
        context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * toInt(obj.scale) * 0.01, 0, TWO_PI);
        context.stroke();
    }

    function drawCenter(params, obj) {
        applyShadowSettings(obj);

        context.fillStyle = obj.color;
        context.beginPath();
        context.moveTo(wheelBody.position.x, wheelBody.position.y);
        context.arc(wheelBody.position.x, wheelBody.position.y, params.radius * toInt(obj.scale) * 0.01, 0, TWO_PI);
        context.fill();
    }

    function drawTexts(params, obj) {
        const { slices, sliceAngle, radius, cx, cy, angle } = params;

        context.fillStyle = obj.color;
        context.strokeStyle = obj.stroke.color;
        context.lineWidth = obj.stroke.width;
        context.font = radius * 0.0036 * obj.scale + 'px ' + obj['font-face'];

        for (let i = 0; i < slices.length; ++i) {
            context.save();

            applyShadowSettings(obj)

            context.translate(cx, cy);
            context.rotate(angle + (sliceAngle - sliceAngle / 2.0) + sliceAngle * i);
            context.textBaseline = 'middle';
            context.textAlign = 'right';
            context.fillText(slices[i].text, radius * obj.offset * 0.001 + (radius / 2), 0);

            if (obj.stroke.visible) {
                context.shadowColor = 'transparent';
                context.strokeText(slices[i].text, radius * obj.offset * 0.001 + (radius / 2), 0);
            }
            context.restore();
        }
    }

    function drawSlicesImages(params, obj) {
        const slices = options.slices;
        let sliceDegree = 360.0 / slices.length;
        let sliceAngle = deg2rad(sliceDegree);

        for (let i = 0; i < slices.length; ++i) {
            context.save();

            applyShadowSettings(obj);

            context.translate(wheelBody.position.x, wheelBody.position.y);
            context.rotate(wheelBody.angle);
            context.rotate((sliceAngle - sliceAngle / 2.0) + sliceAngle * i);

            const image = imagesData[slices[i].icon].img;
            const size = params.radius * 0.2 * obj.scale / 20;
            const xOffset = params.radius * 0.5 * obj.offset * 0.02;
            context.drawImage(image, xOffset - size / 2, 0 - size / 2, size, size);

            context.restore();
        }
    }

    function drawTongue(params, obj) {
        const { radius } = params;
        context.translate(tongueBody.position.x, tongueBody.position.y);
        context.rotate(tongueBody.angle);

        const scale = radius * 0.0026;
        const w = 30 * scale;
        const arrow = -30 * scale;
        const wing = 16 * scale;
        const start = 32 * scale;

        context.lineWidth = w * scale * 0.3;
        context.strokeStyle = obj.outline.color;

        context.beginPath();
        context.moveTo(start, 0);
        context.lineTo(wing, -w);
        context.lineTo(arrow, 0);
        context.lineTo(wing, w);
        context.lineTo(start, 0);
        context.closePath();

        applyShadowSettings(obj);

        context.stroke();

        context.shadowColor = 'transparent';
        const rgbObj = hexToRgb(obj.inner.color);

        context.fillStyle = `rgba(${rgbObj.r},${rgbObj.g},${rgbObj.b}, ${obj.inner.alpha})`;
        context.fill();
    }

    function drawCollisionCircles(params) {
        const { arr, radius } = calcCollisionCircles();

        for (let i = 0; i < arr.length; ++i) {
            context.beginPath();
            context.arc(arr[i].x, arr[i].y, radius, 0, TWO_PI);
            context.stroke();
        }

        // const { min, max } = tongueBody.bounds;
        // const x = max.x - min.x;
        // const y = max.y - min.y;

        context.beginPath();
        context.arc(tongueBody.position.x, tongueBody.position.y, params.radius * 0.02, 0, TWO_PI);
        context.stroke();
    }

    function drawCenterImage(params, obj) {
        const image = imagesData.tata.img;
        const scale = params.radius * obj.scale / 10000;

        const w = image.width * scale;
        const h = image.height * scale;
        const x = wheelBody.position.x - w / 2;
        const y = wheelBody.position.y - h / 2;

        applyShadowSettings(obj);

        context.drawImage(image, x, y, w, h);
    }

    function draw() {
        const params = {
            radius: getRadius(),
            slices: options.slices,
            sliceAngle: deg2rad(360.0 / options.slices.length),
            cx: wheelBody.position.x,
            cy: wheelBody.position.y,
            angle: wheelBody.angle
        };

        if (drawPhysics) {
            context.globalAlpha = 0.5;
            Render.world(render);
            // return;
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.globalAlpha = 1;
        }

        const { visuals } = options;

        drawTask(params, { visible: true }, drawSlices);
        drawTask(params, visuals.dividers, drawDividers);
        drawTask(params, visuals.texts, drawTexts);
        drawTask(params, visuals.slicesimages, drawSlicesImages);
        drawTask(params, visuals['inner-ring'], drawInnerRing);
        drawTask(params, visuals.center, drawCenter);
        drawTask(params, visuals['outer-ring-1'], drawOuterRing);
        drawTask(params, visuals['outer-ring-2'], drawOuterRing);
        drawTask(params, visuals['rods-main'], drawRodsMain);
        drawTask(params, visuals['rods-sub'], drawRodsSub);
        drawTask(params, visuals.tongue, drawTongue);
        drawTask(params, visuals['center-logo'], drawCenterImage);
        drawTask(params, visuals['collision-circles'], drawCollisionCircles);

        document.getElementById('dump').innerHTML = JSON.stringify(dump, null, 2);
    }

    function spin() {
        spinning = true;
        flasher.setup();

        const speedMin = toInt(options['speed-min'].value);
        const speedMax = toInt(options['speed-max'].value);
        const velocity = getRandom(speedMin, speedMax);
        // const velocity = speedMax;

        dump.min = speedMin;
        dump.max = speedMax;
        dump.velocity = velocity;
        dump.mass = wheelBody.mass;

        wheelBody.torque = velocity * wheelBody.mass * 3.0;
    }

    function applyShadowSettings(obj) {
        const shadow = obj.shadow;
        if (shadow) {
            context.shadowColor = shadow.color;
            context.shadowBlur = shadow.blur;
            context.shadowOffsetX = shadow.offsetx;
            context.shadowOffsetY = shadow.offsety;
        }
    }

    function init() {
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

        const tongueBodyWidth = ch * 0.12;
        const tongueBodyHeight = ch * 0.015;

        tongueBody = Bodies.rectangle(cw * 0.9, ch / 2, tongueBodyWidth, tongueBodyHeight);

        let x = cw / 2;
        let y = ch / 2;
        let w = ch * 0.96;
        let h = w * 0.02;
        let sc = 1.75;
        const density = 0.02; // Default: 0.001

        const divider1 = Bodies.rectangle(x, y, w, h * sc, { density });
        const divider11 = Bodies.rectangle(x, y, w, h, { density });
        const divider2 = Bodies.rectangle(x, y, w, h * sc, { density });
        const divider22 = Bodies.rectangle(x, y, w, h, { density });
        const divider3 = Bodies.rectangle(x, y, w, h * sc, { density });
        const divider33 = Bodies.rectangle(x, y, w, h, { density });

        const step = 30;
        let degrees = 0;
        Body.setAngle(divider1, deg2rad(degrees));

        degrees += step;
        Body.setAngle(divider11, deg2rad(degrees));


        degrees += step;
        Body.setAngle(divider2, deg2rad(degrees));

        degrees += step;
        Body.setAngle(divider22, deg2rad(degrees));


        degrees += step;
        Body.setAngle(divider3, deg2rad(degrees));

        degrees += step;
        Body.setAngle(divider33, deg2rad(degrees));

        wheelBody = Body.create({
            parts: [
                divider1, divider11,
                divider2, divider22,
                divider3, divider33,
            ]
        });

        const constraintWheel = Constraint.create({
            pointA: { x: cw / 2, y: ch / 2 },
            bodyB: wheelBody,
            length: 0
        })

        const constraintTongue = Constraint.create({
            pointA: { x: cw * 0.96, y: ch * 0.5 },
            bodyB: tongueBody,
            pointB: { x: tongueBodyWidth / 3, y: 0 },
            length: 0
        });

        // stiffness
        // A value of 0.1 means the constraint will apply heavy damping, resulting in little to no oscillation.
        // A value of 0 means the constraint will apply no damping.

        const stiffness = 0.03;

        const constraintSpring0 = Constraint.create({
            pointA: { x: cw * 0.75, y: ch * 0.4 },
            bodyB: tongueBody,
            pointB: { x: -tongueBodyWidth / 4, y: 0 },
            stiffness,
        });

        const constraintSpring1 = Constraint.create({
            pointA: { x: cw * 0.75, y: ch - ch * 0.4 },
            bodyB: tongueBody,
            pointB: { x: -tongueBodyWidth / 4, y: 0 },
            stiffness,
        });

        World.add(engine.world, [
            tongueBody,
            wheelBody,
            constraintTongue,
            constraintSpring0,
            constraintSpring1,
            constraintWheel,
        ]);

        engine.positionIterations = 12;
        engine.velocityIterations = 8;
        engine.constraintIterations = 4;

        const defaultRotationDegree = getRandom(12, 14);
        Body.rotate(wheelBody, deg2rad(defaultRotationDegree));
    }

    function update() {
        Engine.update(engine);
        if (spinning) {
            checkSelectedSliceAfterSpinning();
        }
    }

    function checkSelectedSliceAfterSpinning() {
        if (wheelBody.angularSpeed < 0.001 && tongueBody.angularSpeed < 0.001) {
            const slices = options.slices;
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

    function getRadius() {
        return (canvas.height / 2) * 0.95;
    }

    function calcCollisionCircles() {
        const slices = options.slices;
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

    function stop() {
        spinning = false;
        flasher.setup();
        Body.setAngularVelocity(wheelBody, 0);
    }

    function toggleDrawPhysics() {
        drawPhysics = !drawPhysics;
    }

    return {
        init,
        draw,
        spin,
        stop,
        update,
        toggleDrawPhysics,
        testRandomness () {
            testRandomness = true;
            options.slices.forEach(slice => {
                slice.color = rgbToHex2(255, 255, 255);
            });
        }
    };
}
