'use strict';

let fw;
const dump = {};

const modalElem = document.querySelector('#question-modal');
const questionTitleElem = document.querySelector('#question-title');
const questionTextElem = document.querySelector('#question-text');

modalElem.addEventListener('click', () => {
    modalElem.style.display = 'none';
    questionTextElem.innerHTML = 'What do you get when you cross a mentally ill loner with a society that abandons him and treats him like trash?';
});

document.querySelector('#spinTheWheel').addEventListener('click', () => {
    console.log('spin');
    fw.spin();
});

document.querySelector('#stopTheWheel').addEventListener('click', () => {
    console.log('stop');
    fw.stop();
});

document.querySelector('#justATest').addEventListener('click', () => {
    modalElem.style.display = 'block';
    showRandomQuestion();
});

document.querySelector('#renderMatter').addEventListener('click', () => {
    fw.toggleDrawPhysics();
});

window.addEventListener('resize', () => {
    setCanvasSize();
    fw.init();
}, false);

function loadImages() {
    return new Promise((resolve, reject) => {

        const imagesDataKeys = Object.keys(imagesData);
        let loadedImageCount = 0;

        const onload = () => {
            console.log('image loaded');
            if (++loadedImageCount === imagesDataKeys.length) {
                resolve('all images loaded');
            }
        }

        imagesDataKeys.forEach(key => {
            const imageObj = imagesData[key];
            console.log(`loading [${imageObj.fileName}] image...`);
            imageObj.img = new Image();
            imageObj.img.src = `./assets/${imageObj.fileName}.png`;
            imageObj.img.onload = onload
        });

    });
}

function setCanvasSize() {
    const h = window.innerHeight; // * 0.75;

    const canvas = getCanvas();

    canvas.width = h * 1.2;
    canvas.height = h;

    canvas.style.left = (window.innerWidth / 2 - canvas.width / 2) + 'px';
    canvas.style.top = (window.innerHeight / 2 - canvas.height / 2) + 'px';
}

function getCanvas() {
    return document.querySelector('#fortune-wheel-canvas');
}

function animate() {
    fw.update();
    fw.draw();
    window.requestAnimationFrame(animate);
}

(function init() {
    setCanvasSize();
    loadImages().then(resp => {
        console.log(`${resp} begin`);
        fw = fortuneWheel(wheelData, getCanvas());
        fw.init();
        window.requestAnimationFrame(animate);
    });
})();

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
