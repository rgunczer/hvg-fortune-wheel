'use strict';

let fw;
const dump = {};
let defaultQuestions;
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

document.querySelector('#inputFileQuestions').addEventListener('change', e => {
    openFile(e);
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
    loadDefaultQuestions(function (response) {
        // const q = JSON.parse(response);
        defaultQuestions = JSON.parse(response);
        questions = JSON.parse(response);
    });
})();

function loadDefaultQuestions(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'defaultQuestions.json', true);
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

    filteredQuestions = questions.filter(x => x.type === selectedSlice);


    if (filteredQuestions.length === 0) {
        filteredQuestions = questions.filter(x => x.type === "any");
        if (filteredQuestions.length === 0) {
            return questions;
        }
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

function openFile(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var node = document.getElementById('output');
        // node.innerText = text; // TODO: error message could be shown here?
       
        try {
            parseText(text);
            alert(`Imported questions:\n\n${text}`);
        }
        catch {
            alert('Error');
        }
    };
    reader.readAsText(input.files[0]);
}

function parseText(text) {
    let importedQuestions = [];

    function createNewQuestionObject(a) {
        let questionElement = {
            type: 'any',
            text: '',
            choices: null
        };
        const delimiter = ';'; // TODO: from global
        const parts = a.split(delimiter);

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.startsWith('Q:')) {
                questionElement.text = part.substring(2);
            }
            if (part.startsWith('C:')) {
                questionElement.choices = part.substring(2);
            }
            if (part.startsWith('T:')) {
                questionElement.type = part.substring(2);
            }
        }

        importedQuestions.push(questionElement);
    }

    var lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        createNewQuestionObject(lines[i].replace(/(\r\n|\n|\r)/gm, ""));
    }

    questions = [...importedQuestions];
}
