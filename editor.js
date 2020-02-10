(function () {

    (function () {
        ['flashing-color', 'flashing-time', 'speed-min', 'speed-max'].forEach(id => {
            const el = document.getElementById(id);
            el.value = wheelData[id];

            el.addEventListener('change', (event) => {
                console.log(`${id} changed`, event.target.value);
                wheelData[id] = el.value;
            });
        });
    })();

    (function () {
        const showHideButtonId = 'show-hide-editor';
        const showHideDebugButtonId = 'show-hide-debug';
        const testRandomnessButtonId = 'test-randomness';
        [showHideButtonId, showHideDebugButtonId, testRandomnessButtonId].forEach(buttonId => {

            document.getElementById(buttonId).addEventListener('click', (event) => {

                const id = event.target.getAttribute('id');

                switch (id) {
                    case showHideButtonId: {
                        const el = document.getElementById('editor');
                        showHideElement(el);
                    }
                        break;

                    case showHideDebugButtonId: {
                        const el = document.getElementById('dump');
                        showHideElement(el);
                    }
                        break;

                    case testRandomnessButtonId: {
                        testRandomness = true;
                        wheelData.slices.forEach(slice => {
                            slice.color = rgbToHex2(255, 255, 255);
                        });
                    }
                        break;
                }

            });

        });
    })();

    (function () {
        const bgColorEl = document.querySelector('#page-bg-color');
        const style = getComputedStyle(document.body);
        bgColorEl.value = rgbToHex(style.backgroundColor);
        bgColorEl.addEventListener('change', (event) => {
            console.log('page background color changed', event.target.value);
            document.body.style.backgroundColor = bgColorEl.value;
        });

        const pageBgColor = localStorage.getItem('bg-color');
        if (pageBgColor !== null) {
            document.body.style.backgroundColor = pageBgColor;
            bgColorEl.value = rgbToHex(document.body.style.backgroundColor);
        }

        document.querySelector('#save-settings').addEventListener('click', () => {
            localStorage.setItem('bg-color', document.body.style.backgroundColor);
        });

        document.querySelector('#load-settings').addEventListener('click', () => {
            document.body.style.backgroundColor = localStorage.getItem('bg-color');
            bgColorEl.value = rgbToHex(document.body.style.backgroundColor);
        });

        document.querySelector('#export-settings').addEventListener('click', () => {
            const json = JSON.stringify(wheelData.visuals, null, 2);
            navigator.clipboard.writeText(json).then(() => {
                alert('Data is on Clipboard');
            });
        });
    })();

    (function () {
        const editorHostEl = document.querySelector('#editor-host');
        const visualsListEl = document.querySelector('#wheel-visuals');

        function getWheelVisualOptions() {
            const html = Object.keys(wheelData.visuals).sort().map(key => {
                return `<option value='${key}'>${key}</option>`;
            });
            return html.join('');
        }

        function createElemWithClass(type, classToAdd) {
            const el = document.createElement(type);
            el.classList.add(classToAdd);
            return el;
        }

        function createLabel(text, forHtml) {
            const el = document.createElement('label');
            el.setAttribute('for', forHtml);
            el.innerHTML = text;
            return el;
        }

        function createWrapperDivWithLabel(hostEl, labelText, idName) {
            const divEl = createElemWithClass('div', 'input');
            hostEl.appendChild(divEl);

            const labelEl = createLabel(labelText, idName);
            divEl.appendChild(labelEl);

            return divEl;
        }

        function setupEventHandler(el, eventName, obj, propName, eventTargetPropName = 'value') {

            function createUpdateHandler(obj, propName) {
                return function (event) {
                    obj[propName] = event.target[eventTargetPropName];
                }
            }

            const eventHandlerFn = createUpdateHandler(obj, propName);
            el.addEventListener(eventName, eventHandlerFn);
        }

        function createSection(name) {
            const hrEl = document.createElement('hr');
            editorHostEl.appendChild(hrEl);

            const h4El = document.createElement('h4');
            h4El.style.paddingBottom = '10px';
            h4El.innerHTML = name;
            editorHostEl.appendChild(h4El);
        }

        function createInputElement(hostEl, type, idAndName) {
            const el = document.createElement('input');
            el.type = type;
            el.name = idAndName;
            el.id = idAndName;
            hostEl.appendChild(el);

            return el;
        }

        function createColorEditor(obj, propName, hostEl, labelText, idAndName) {
            const divEl = createWrapperDivWithLabel(hostEl, labelText);
            const inputEl = createInputElement(divEl, 'color', idAndName);

            inputEl.value = obj[propName];

            setupEventHandler(inputEl, 'change', obj, propName);
        }

        function createRangeEditor(obj, propName, hostEl, labelText, idAndName, rangeProps) {
            const divEl = createWrapperDivWithLabel(hostEl, labelText);

            const datalistEl = document.createElement('datalist');
            datalistEl.id = "tickmarks-" + idAndName;

            let options = '';
            rangeProps.values.forEach(value => {
                options += `<option value="${value}" />`;
            });

            datalistEl.innerHTML = options;

            divEl.appendChild(datalistEl);

            const inputEl = createInputElement(divEl, 'range', idAndName);
            inputEl.min = rangeProps.min;
            inputEl.max = rangeProps.max;

            if (rangeProps.step) {
                inputEl.step = rangeProps.step;
            }

            // inputEl.list = dataListElem; // not working, SO
            inputEl.setAttribute('list', datalistEl.id);

            inputEl.value = obj[propName];

            setupEventHandler(inputEl, 'input', obj, propName);
        }

        function createCheckBoxEditor(obj, propName, hostEl, idName, labelText) {
            const divEl = createWrapperDivWithLabel(hostEl, labelText);
            const inputEl = createInputElement(divEl, 'checkbox', idName);

            inputEl.checked = obj[propName];

            setupEventHandler(inputEl, 'change', obj, propName, 'checked');
        }

        function createTextEditor(obj, propName, hostEl, labelText, idName) {
            const divEl = createWrapperDivWithLabel(hostEl, labelText);
            const inputEl = createInputElement(divEl, 'text', idName);

            inputEl.value = obj[propName];

            setupEventHandler(inputEl, 'input', obj, propName);
        }

        function createEditorUi(selectedVisualItem, key) {
            const range0to100by10 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

            switch (key) {
                case 'visible':
                    createCheckBoxEditor(selectedVisualItem, key, editorHostEl, 'visibility', 'Visible:');
                    break;

                case 'color':
                    createColorEditor(selectedVisualItem, key, editorHostEl, 'Color:', 'color');
                    break;

                case 'scale': {
                    const rangeSetup = {
                        min: 0,
                        max: 100,
                        values: range0to100by10
                    };
                    createRangeEditor(selectedVisualItem, key, editorHostEl, 'Scale:', 'scale', rangeSetup);
                }
                    break;

                case 'offset': {
                    if (selectedVisualItem.hasOwnProperty('offset-max')) {
                        const offsetMax = selectedVisualItem['offset-max'];
                        const rangeSetup = {
                            min: 0,
                            max: offsetMax,
                            values: [0, offsetMax * 0.25, offsetMax * 0.5, offsetMax * 0.75, offsetMax]
                        };
                        createRangeEditor(selectedVisualItem, key, editorHostEl, 'Offset:', 'offset', rangeSetup);
                    } else {
                        const rangeSetup = {
                            min: 0,
                            max: 100,
                            values: range0to100by10
                        };
                        createRangeEditor(selectedVisualItem, key, editorHostEl, 'Offset:', 'offset', rangeSetup);
                    }
                }
                    break;

                case 'text':
                    createTextEditor(selectedVisualItem, key, editorHostEl, 'Text:', 'text');
                    break;
            }

            if (isObject(selectedVisualItem[key])) {
                switch (key) {
                    case 'shadow': {
                        createSection('Shadow');

                        const rangeSetupOffsets = {
                            min: -50,
                            max: 50,
                            values: [-50, -25, 0, 25, 50]
                        };

                        const rangeSetupBlur = {
                            min: 0,
                            max: 100,
                            values: range0to100by10
                        };

                        createColorEditor(selectedVisualItem.shadow, 'color', editorHostEl, 'Color:', 'shadow-color');
                        createRangeEditor(selectedVisualItem.shadow, 'blur', editorHostEl, 'Blur:', 'shadow-blur', rangeSetupBlur);
                        createRangeEditor(selectedVisualItem.shadow, 'offsetx', editorHostEl, 'Offset X:', 'shadow-offsetx', rangeSetupOffsets);
                        createRangeEditor(selectedVisualItem.shadow, 'offsety', editorHostEl, 'Offset Y:', 'shadow-offsety', rangeSetupOffsets);
                    }
                        break;

                    case 'outline':
                        createColorEditor(selectedVisualItem.outline, 'color', editorHostEl, 'Outline Color:', 'outline-color');
                        break;

                    case 'inner': {
                        const rangeSetup = {
                            min: 0,
                            max: 1,
                            values: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                            step: 0.1
                        };
                        createColorEditor(selectedVisualItem.inner, 'color', editorHostEl, 'Inner Color:', 'inner-color');
                        createRangeEditor(selectedVisualItem.inner, 'alpha', editorHostEl, 'Inner Color Alpha:', 'inner-color-alpha', rangeSetup);
                    }
                        break;

                    case 'stroke': {
                        createSection('Stroke');

                        const rangeSetup = {
                            min: 0,
                            max: 10,
                            values: [0, 5, 10, 15, 20],
                        };
                        createCheckBoxEditor(selectedVisualItem.stroke, 'visible', editorHostEl, 'stroke-visibility', 'Stroke Visible:');
                        createColorEditor(selectedVisualItem.stroke, 'color', editorHostEl, 'Stroke Color:', 'stroke-color');
                        createRangeEditor(selectedVisualItem.stroke, 'width', editorHostEl, 'Stroke Width:', 'stroke-width', rangeSetup);
                    }
                        break;
                }
            }
        }

        visualsListEl.innerHTML = getWheelVisualOptions();

        visualsListEl.addEventListener('change', (event) => {
            const selectedVisualItem = wheelData.visuals[event.target.value];

            while (editorHostEl.firstChild) {
                editorHostEl.removeChild(editorHostEl.firstChild);
            }

            Object.keys(selectedVisualItem).forEach(key => {
                if (selectedVisualItem.hasOwnProperty(key)) {
                    createEditorUi(selectedVisualItem, key);
                }
            });
        });

    })();

})();
