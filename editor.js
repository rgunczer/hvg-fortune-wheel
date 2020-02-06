
(function () {

    [
        { name: 'color', event: 'change' },
        { name: 'text', event: 'input' }
    ].forEach(obj => {

        for (let i = 0; i < wheelData.slices.length; ++i) {


            const elem = document.querySelector(`#slice-${i}-${obj.name}`);

            if (obj.name === 'color') {
                if (wheelData.slices[i][obj.name].startsWith('#')) {
                    elem.value = wheelData.slices[i][obj.name];
                } else {
                    elem.value = rgbToHex(wheelData.slices[i][obj.name]);
                }
            } else {
                elem.value = wheelData.slices[i][obj.name];
            }

            elem.addEventListener(obj.event, (event) => {
                console.log(`slice [${i}] ${obj.name} changed`, event.target.value);
                wheelData.slices[i][obj.name] = event.target.value;
                draw();
            });

        }

    });

    const colorSizeArray = [
        { name: 'color', event: 'change' },
        { name: 'size', event: 'input' }
    ];

    colorSizeArray.forEach(obj => {

        const elem = document.querySelector(`#outer-ring-${obj.name}`);
        elem.value = wheelData.outerRing[obj.name];

        elem.addEventListener(obj.event, (event) => {
            console.log(`outer ring ${obj.name} changed`, event.target.value);
            wheelData.outerRing[obj.name] = event.target.value;
            draw();
        });

    });

    [
        { name: 'size', event: 'input' },
        { name: 'offset', event: 'input' },
    ].forEach(obj => {

        const elem = document.querySelector(`#slicesimages-${obj.name}`);
        elem.value = parseInt(wheelData.slicesimages[obj.name], 10);

        elem.addEventListener(obj.event, (event) => {
            console.log(`slicesimages ${obj.name} changed`, event.target.value);
            wheelData.slicesimages[obj.name] = parseInt(event.target.value, 10);
            draw();
        });

    });

    [
        ...colorSizeArray,
        { name: 'offset', event: 'input' }
    ].forEach(obj => {

        const elem = document.querySelector('#text-' + obj.name);
        elem.value = wheelData.text[obj.name];

        elem.addEventListener(obj.event, (event) => {
            console.log(`text ${obj.name} changed`, event.target.value);
            wheelData.text[obj.name] = elem.value;
            draw();
        });

    });

    ['color', 'time'].forEach(key => {
        const elem = document.querySelector('#selected-slice-flash-' + key);
        elem.value = wheelData.flashing[key];

        elem.addEventListener('change', (event) => {
            console.log(`selected slice flash ${key} changed`, event.target.value);
            wheelData.flashing[key] = elem.value;
            draw();
        });
    });

    ['min', 'max'].forEach(key => {
        const elem = document.querySelector(`#wheel-${key}-speed`);
        if (elem) {
            elem.value = wheelSpeed[key];

            elem.addEventListener('change', (event) => {
                console.log('wheel Speed ' + key + ' changed', event.target.checked);
                wheelSpeed[key] = elem.value;
            });
        }
    });

    colorSizeArray.forEach(obj => {

        const elem = document.querySelector('#center-' + obj.name);
        elem.value = wheelData.center[obj.name];

        elem.addEventListener(obj.event, (event) => {
            console.log(`center ${obj.name} changed`, event.target.value);
            wheelData.center[obj.name] = elem.value;
            draw();
        });

    });

    colorSizeArray.forEach(obj => {

        const elem = document.querySelector('#dividers-' + obj.name);
        elem.value = wheelData.dividers[obj.name];

        elem.addEventListener(obj.event, (event) => {
            console.log(`dividers ${obj.name} changed`, event.target.value);
            wheelData.dividers[obj.name] = elem.value;
            draw();
        });

    });

    colorSizeArray.forEach(obj => {

        const elem = document.querySelector('#inner-ring-' + obj.name);
        elem.value = wheelData.innerRing[obj.name];

        elem.addEventListener(obj.event, (event) => {
            console.log(`inner ring ${obj.name} changed`, event.target.value);
            wheelData.innerRing[obj.name] = elem.value;
            draw();
        });

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
            const elem = document.getElementById('editor');

            if (elem.style.display === 'block') {
                elem.style.display = 'none';
            } else {
                elem.style.display = 'block';
            }
        });

    document.querySelector('#show-hide-debug')
        .addEventListener('click', () => {
            const elem = document.getElementById('dump');

            if (elem.style.display === 'block') {
                elem.style.display = 'none';
            } else {
                elem.style.display = 'block';
            }
        });


    const pageBgColorElem = document.querySelector('#page-bg-color');

    const style = getComputedStyle(document.body);

    pageBgColorElem.value = rgbToHex(style.backgroundColor);

    pageBgColorElem.addEventListener('change', (event) => {
        console.log('drawFlags page background color changed', event.target.checked);
        document.body.style.backgroundColor = pageBgColorElem.value;
        draw();
    });

    document.querySelector('#save-settings').addEventListener('click', () => {
        localStorage.setItem('bg-color', document.body.style.backgroundColor);
    });

    document.querySelector('#load-settings').addEventListener('click', () => {
        document.body.style.backgroundColor = localStorage.getItem('bg-color');
        pageBgColorElem.value = rgbToHex(document.body.style.backgroundColor);
    });

    const pageBgColor = localStorage.getItem('bg-color');
    if (pageBgColor !== null) {
        document.body.style.backgroundColor = pageBgColor;
        pageBgColorElem.value = rgbToHex(document.body.style.backgroundColor);
    }

    document.querySelector('#test-randomness').addEventListener('click', () => {
        testRandomness = true;
        wheelData.slices.forEach(slice => {
            slice.color = rgbToHex2(255, 255, 255);
        });
    });

})();
