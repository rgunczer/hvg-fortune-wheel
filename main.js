'use strict';

let fw;
const dump = {};
let questions;

const modalElem = document.querySelector('#question-modal');
const questionChoicesElem = document.querySelector('#question-choices');
const questionTextElem = document.querySelector('#question-text');

modalElem.addEventListener('click', () => {
    hideModalAndReset();
});

document.querySelector('#spinTheWheel').addEventListener('click', () => {
    fw.spin();
});

document.querySelector('#stopTheWheel').addEventListener('click', () => {
    fw.stop();
});

document.querySelector('#justATest').addEventListener('click', () => {
    modalElem.style.display = 'block';
    showRandomQuestion(document.getElementById('sliceText').value);
});

document.querySelector('#renderMatter').addEventListener('click', () => {
    fw.toggleDrawPhysics();
});

document.addEventListener('keyup', (event) => {
    const enter = 13;
    const space = 32;
    if (event.keyCode === space) {
        if (fw.isSpinning()) {
            return;
        } else if (isModalVisible()) {
            hideModalAndReset();
        } else {
            fw.spin();
        }
    }
});

window.addEventListener('resize', () => {
    setCanvasSize();
    fw.init();
}, false);

function isModalVisible() {
    return modalElem.style.display === 'block';
}

function hideModalAndReset() {
    modalElem.style.display = 'none';
    questionTextElem.innerHTML = '';
}

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
        fw = fortuneWheel(wheelConfig, getCanvas(), showRandomQuestion);
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

let previousObj = {
    index: -1,
    type: null
};

function showRandomQuestion(selectedSlice) {
    let filteredQuestions = filterQuestions(selectedSlice);
    let rndNum = previousObj.index;

    if (filteredQuestions.length === 1) {
        rndNum = 0;
    } else {
        rndNum = getDifferentRandomThanLastOne(selectedSlice, filteredQuestions.length - 1);
    }

    previousObj.type = selectedSlice;
    previousObj.index = rndNum;

    updateQuestionElements(filteredQuestions[rndNum]);
}

function filterQuestions(selectedSlice) {
    let filteredQuestions = [];

    switch (selectedSlice) {
        case "corporate":
        case "life":
            filteredQuestions = questions.filter(x => x.type === selectedSlice);
            break;

        default:
            filteredQuestions = questions.filter(x => x.type === "any");
    }

    if (filteredQuestions.length === 0) {
        return questions;
    }

    return filteredQuestions;
}

function getDifferentRandomThanLastOne(selectedSlice, max) {
    let rndNum = getRandom(0, max);

    if (previousObj.type === selectedSlice && previousObj.index === rndNum) {
        while (previousObj.index === rndNum) {
            rndNum = getRandom(0, max);
        }
    }

    return rndNum;
}

function updateQuestionElements(question) {
    questionTextElem.innerHTML = question.text;
    if (question.choices) {
        questionChoicesElem.innerHTML = question.choices;
    } else {
        questionChoicesElem.innerHTML = null;
    }

    modalElem.style.display = 'block';
}
