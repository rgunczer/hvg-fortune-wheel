
(function () {

    // [
    //     { name: 'color', event: 'change' },
    //     { name: 'text', event: 'input' }
    // ].forEach(obj => {
    //     const slices = wheelData.slices;

    //     for (let i = 0; i < slices.length; ++i) {

    //         const elem = document.querySelector(`#slice-${i}-${obj.name}`);

    //         if (obj.name === 'color') {
    //             if (slices[i][obj.name].startsWith('#')) {
    //                 elem.value = slices[i][obj.name];
    //             } else {
    //                 elem.value = rgbToHex(slices[i][obj.name]);
    //             }
    //         } else {
    //             elem.value = slices[i][obj.name];
    //         }

    //         elem.addEventListener(obj.event, (event) => {
    //             console.log(`slice [${i}] ${obj.name} changed`, event.target.value);
    //             slices[i][obj.name] = event.target.value;
    //             draw();
    //         });

    //     }

    // });

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
            elem.value = wheelData[key];

            elem.addEventListener('change', (event) => {
                console.log('wheel Speed ' + key + ' changed', event.target.checked);
                wheelData[key] = elem.value;
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

    (function elementEditor() {

        function getPropValue(obj, path) {
            value = obj[path[0]];
            for (let i = 1; i < path.length; ++i) {
                value = value[path[i]];
            }
            return value;
        }

        function getLastItemInArray(arr) {
            return arr[arr.length - 1];
        }

        function setPropValue(selectedWheelElement, control, value) {
            let obj = selectedWheelElement;

            for(let i = 0; i < control.propPath.length - 1; ++i) {
                const propN = control.propPath[i];
                obj = obj[propN];
            }

            const propName = getLastItemInArray(control.propPath);
            if (obj.hasOwnProperty(propName)) {
                obj[propName] = value;
            }
        }

        const controls = [
            { domName: 'visibility', domPropToSet: 'checked', propPath: ['visible'], event: 'change', defaultValue: true },
            { domName: 'color', domPropToSet: 'value', propPath: ['color'], event: 'change', defaultValue: '#ffffff' },
            { domName: 'scale', domPropToSet: 'value', propPath: ['size'], event: 'input', defaultValue: 1 },
            { domName: 'offset', domPropToSet: 'value', propPath: ['offset'], event: 'input', defaultValue: 1 },
            { domName: 'text', domPropToSet: 'value', propPath: ['text'], event: 'input', defaultValue: '-' },
            { domName: 'shadow-color', domPropToSet: 'value', propPath: ['shadow', 'color'], event: 'change', defaultValue: '#000000' },
            { domName: 'shadow-blur', domPropToSet: 'value', propPath: ['shadow', 'blur'], event: 'input', defaultValue: 0 },
            { domName: 'shadow-offsetx', domPropToSet: 'value', propPath: ['shadow', 'offsetx'], event: 'input', defaultValue: 0 },
            { domName: 'shadow-offsety', domPropToSet: 'value', propPath: ['shadow', 'offsety'], event: 'input', defaultValue: 0 }
        ];

        let selectedWheelElement = null;

        let html = '';
        const ddlElem = document.querySelector('#wheel-elements');
        Object.keys(wheelData.visuals).sort().forEach(key => {
            html += `<option value='${key}'>${key}</option>`;
        });
        ddlElem.innerHTML = html;

        ddlElem.addEventListener('change', () => {
            const key = ddlElem.value;
            console.log(`dropdown change [${key}]`);
            selectedWheelElement = wheelData.visuals[key];

            controls.forEach(control => {
                const el = document.querySelector('#' + control.domName);
                el[control.domPropToSet] = getPropValue(selectedWheelElement, control.propPath)
            });

        });

        controls.forEach(control => {
            const el = document.querySelector('#' + control.domName);
            console.log(el);

            el.addEventListener(control.event, (event) => {
                if (selectedWheelElement) {
                    console.log(control);

                    const value = event.target[control.domPropToSet];
                    console.log(value);

                    setPropValue(selectedWheelElement, control, value);
                }
            });
        });

    })();



})();
