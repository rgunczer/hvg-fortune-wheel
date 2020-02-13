'use strict';

let fw;
const dump = {};
let questions;

const modalElem = document.querySelector('#question-modal');
const questionChoicesElem = document.querySelector('#question-choices');
const questionTextElem = document.querySelector('#question-text');

modalElem.addEventListener('click', () => {
    modalElem.style.display = 'none';
    questionTextElem.innerHTML = 'What do you get when you cross a mentally ill loner with a society that abandons him and treats him like trash?';
});

document.querySelector('#spinTheWheel').addEventListener('click', () => {
    fw.spin();
});

document.querySelector('#stopTheWheel').addEventListener('click', () => {
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
            if (++loadedImageCount === imagesDataKeys.length) {
                resolve('all images loaded');
            }
        }

        imagesDataKeys.forEach(key => {
            const imageObj = imagesData[key];
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
    loadImages().then(() => {
        fw = fortuneWheel(wheelData, getCanvas());
        fw.init();
        window.requestAnimationFrame(animate);
    });
    loadQuestions(function (response) {
        questions = JSON.parse(response);
    });
})();

function loadQuestions(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'questions.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function showRandomQuestion(selectedSlice) {
    let filteredQuestions = [];

    switch (selectedSlice) {
        case "corporate":
        case "life":
            filteredQuestions = questions.filter(x => x.type === selectedSlice);
            break;

        default:
            filteredQuestions = questions.filter(x => x.type === "any");
    }

    // let rndNum = -1;

    let rndNum = getRandom(0, filteredQuestions.length - 1);
    console.log('length: ' + filteredQuestions.length + '   random:  ' + rndNum);

    questionTextElem.innerHTML = filteredQuestions[rndNum].text;
    if (filteredQuestions[rndNum].choices) {
        questionChoicesElem.innerHTML = filteredQuestions[rndNum].choices;
    } else {
        questionChoicesElem.innerHTML = null;
    }

    modalElem.style.display = 'block';
}
