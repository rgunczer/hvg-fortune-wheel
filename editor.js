
(function () {

    for (let i = 0; i < wheelData.slices.length; ++i) {

        const elemColorPicker = document.querySelector('#slice-' + i + '-color');

        if (wheelData.slices[i].color.startsWith('#')) {
            elemColorPicker.value = wheelData.slices[i].color;
        } else {
            const arr = wheelData.slices[i].color.split(',');
            const r = parseInt(arr[0], 10);
            const g = parseInt(arr[1], 10);
            const b = parseInt(arr[2], 10);
            elemColorPicker.value = rgbToHex(r, g, b);
        }

        elemColorPicker.addEventListener('change', (event) => {

            console.log('slice ' + i + ' color changed', event.target.value);

            wheelData.slices[i].color = event.target.value;

            draw();
        });

        const elemText = document.querySelector('#slice-' + i + '-text');

        elemText.value = wheelData.slices[i].text;

        elemText.addEventListener('input', (event) => {

            console.log('slice ' + i + ' text changed', event.target.value);

            wheelData.slices[i].text = event.target.value;

            draw();
        });
    }

    const elemOuterRingColor = document.querySelector('#outer-ring-color');

    elemOuterRingColor.value = wheelData.outerRing.color;

    elemOuterRingColor.addEventListener('change', (event) => {

        console.log('outer ring color changed', event.target.value);

        wheelData.outerRing.color = event.target.value;

        draw();

    });

    const elemOuterRingSize = document.querySelector('#outer-ring-size');

    elemOuterRingSize.value = wheelData.outerRing.size;

    elemOuterRingSize.addEventListener('change', (event) => {

        console.log('outer ring size changed', event.target.value);

        wheelData.outerRing.size = event.target.value;

        draw();
    });


    const elemTextColor = document.querySelector('#text-color');

    elemTextColor.value = wheelData.text.color;

    elemTextColor.addEventListener('change', (event) => {

        console.log('text color changed', event.target.value);

        wheelData.text.color = elemTextColor.value;

        draw();
    });

    const elemTextSize = document.querySelector('#text-size');

    elemTextSize.value = wheelData.text.size;

    elemTextSize.addEventListener('change', (event) => {

        console.log('text size changed', event.target.value);

        wheelData.text.size = elemTextSize.value;

        draw();
    });

    const elemTextOffset = document.querySelector('#text-offset');

    elemTextOffset.value = wheelData.text.offsetFromCenter;

    elemTextOffset.addEventListener('change', (event) => {

        console.log('text offset changed', event.target.value);

        wheelData.text.offsetFromCenter = elemTextOffset.value;

        draw();
    });

    const selectedSliceFlashColor = document.querySelector('#selected-slice-flash-color');

    selectedSliceFlashColor.value = wheelData.flashing.color;

    selectedSliceFlashColor.addEventListener('change', (event) => {

        console.log('selected slice flash color changed', event.target.value);

        wheelData.flashing.color = selectedSliceFlashColor.value;

        draw();
    });

    const flashingTime = document.querySelector('#selected-slice-flash-time');

    flashingTime.value = wheelData.flashing.time;

    flashingTime.addEventListener('change', (event) => {

        console.log('selected slice flash time changed', event.target.value);

        wheelData.flashing.time = flashingTime.value;
    });

    const centerColor = document.querySelector('#center-color');

    centerColor.value = wheelData.center.color;

    centerColor.addEventListener('change', (event) => {

        console.log('center color changed', event.target.value);

        wheelData.center.color = centerColor.value;

        draw();
    });

    const centerSize = document.querySelector('#center-size');

    centerSize.value = wheelData.center.size;

    centerSize.addEventListener('change', (event) => {

        console.log('center color changed', event.target.value);

        wheelData.center.size = centerSize.value;

        draw();
    });

    const dividersColor = document.querySelector('#dividers-color');

    dividersColor.value = wheelData.dividers.color;

    dividersColor.addEventListener('change', (event) => {

        console.log('dividers color changed', event.target.value);

        wheelData.dividers.color = dividersColor.value;

        draw();
    });

    const innerRingColor = document.querySelector('#inner-ring-color');

    innerRingColor.value = wheelData.innerRing.color;

    innerRingColor.addEventListener('change', (event) => {

        console.log('inner ring color changed', event.target.value);

        wheelData.innerRing.color = innerRingColor.value;

        draw();
    });

    const innerRingSize = document.querySelector('#inner-ring-size');

    innerRingSize.value = wheelData.innerRing.size;

    innerRingSize.addEventListener('change', (event) => {

        console.log('inner ring color changed', event.target.value);

        wheelData.innerRing.size = innerRingSize.value;

        draw();
    });

    const dividersSize = document.querySelector('#dividers-size');

    dividersSize.value = wheelData.dividers.size;

    dividersSize.addEventListener('change', (event) => {

        console.log('dividers size changed', event.target.value);

        wheelData.dividers.size = dividersSize.value;

        draw();
    });

    Object.keys(drawFlags).forEach(key => {
        const elem = document.querySelector('#draw-' + toKebabCase(key));
        if (elem) {
            elem.checked = drawFlags[key];

            elem.addEventListener('change', (event) => {
                console.log('drawFlags ' + key + ' changed', event.target.checked);
                drawFlags[key] = elem.checked;
                draw();
            });
        }
    });

    document.querySelector('#show-hide-editor')
        .addEventListener('click', () => {
            const editorElem = document.getElementById('editor');

            if (editorElem.style.display === 'block') {
                editorElem.style.display = 'none';
            } else {
                editorElem.style.display = 'block';
            }
        });


})();
