'use strict';

(function (predefinedColors) {

    class DomUtils {

        static createSection(name, hostEl) {
            const hrEl = document.createElement('hr');
            hostEl.appendChild(hrEl);

            const h4El = document.createElement('h4');
            h4El.style.paddingBottom = '10px';
            h4El.innerHTML = name;
            hostEl.appendChild(h4El);
        }

        static createInputElement(hostEl, type, idAndName) {
            const el = document.createElement('input');
            el.type = type;
            el.name = idAndName;
            el.id = idAndName;
            hostEl.appendChild(el);

            return el;
        }

        static createElemWithClass(type, classToAdd) {
            const el = document.createElement(type);
            el.classList.add(classToAdd);

            return el;
        }

        static createLabel(text, forHtml) {
            const el = document.createElement('label');
            el.setAttribute('for', forHtml);
            el.innerHTML = text;

            return el;
        }

        static createWrapperDivWithLabel(hostEl, labelText, idName) {
            const divEl = this.createElemWithClass('div', 'input');
            hostEl.appendChild(divEl);

            const labelEl = this.createLabel(labelText, idName);
            divEl.appendChild(labelEl);

            return divEl;
        }

        static setupEventHandler(el, eventName, obj, propName, eventTargetPropName = 'value') {

            function createUpdateHandler(obj, propName) {
                return function (event) {
                    obj[propName] = event.target[eventTargetPropName];
                }
            }

            const eventHandlerFn = createUpdateHandler(obj, propName);
            el.addEventListener(eventName, eventHandlerFn);
        }

        static setupEventHandlerColor(el, elToUpdate, eventName, obj, propName, eventTargetPropName = 'value', customCallbackFn = null) {

            function createUpdateHandler(obj, propName) {
                return function (event) {
                    const key = event.target[eventTargetPropName]
                    const colorObj = predefinedColors[key];
                    if (colorObj) {
                        obj[propName] = rgbObjToHex(predefinedColors[key]);
                        elToUpdate.value = obj[propName];
                    } else {
                        obj[propName] = key;
                    }

                    if (customCallbackFn) {
                        customCallbackFn();
                    }
                }
            }

            const eventHandlerFn = createUpdateHandler(obj, propName);
            el.addEventListener(eventName, eventHandlerFn);
        }

        static createComboBoxElement(hostEl) {
            const listEl = document.createElement("select");

            hostEl.appendChild(listEl);

            const option = document.createElement('option');
            option.value = '';
            option.text = '';
            listEl.appendChild(option);

            Object.keys(predefinedColors).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.text = key;
                listEl.appendChild(option);
            })

            return listEl;
        }

        static createColorEditor(obj, propName, hostEl, labelText, idAndName, customCallbackFn) {
            const divEl = this.createWrapperDivWithLabel(hostEl, labelText);

            const inputEl = this.createInputElement(divEl, 'color', idAndName);
            const inputElDdl = this.createComboBoxElement(divEl, 'list', idAndName);

            inputEl.value = obj[propName];

            this.setupEventHandlerColor(inputEl, inputElDdl, 'change', obj, propName, 'value', customCallbackFn);
            this.setupEventHandlerColor(inputElDdl, inputEl, 'change', obj, propName, 'value', customCallbackFn);
        }

        static createCheckBoxEditor(obj, propName, hostEl, idName, labelText) {
            const divEl = this.createWrapperDivWithLabel(hostEl, labelText);
            const inputEl = this.createInputElement(divEl, 'checkbox', idName);

            inputEl.checked = obj[propName];

            this.setupEventHandler(inputEl, 'change', obj, propName, 'checked');
        }

        static createTextEditor(obj, propName, hostEl, labelText, idName) {
            const divEl = this.createWrapperDivWithLabel(hostEl, labelText);
            const inputEl = this.createInputElement(divEl, 'text', idName);

            inputEl.value = obj[propName];

            this.setupEventHandler(inputEl, 'input', obj, propName);
        }

        static createRangeEditor(obj, propName, hostEl, labelText, idAndName, rangeProps) {
            const divEl = this.createWrapperDivWithLabel(hostEl, labelText);

            const datalistEl = document.createElement('datalist');
            datalistEl.id = "tickmarks-" + idAndName;

            let options = '';
            rangeProps.values.forEach(value => {
                options += `<option value="${value}" />`;
            });

            datalistEl.innerHTML = options;

            divEl.appendChild(datalistEl);

            const inputEl = this.createInputElement(divEl, 'range', idAndName);
            inputEl.min = rangeProps.min;
            inputEl.max = rangeProps.max;

            if (rangeProps.step) {
                inputEl.step = rangeProps.step;
            }

            // inputEl.list = dataListElem; // not working, SO
            inputEl.setAttribute('list', datalistEl.id);

            inputEl.value = obj[propName];

            this.setupEventHandler(inputEl, 'input', obj, propName);
        }

    }

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
                        fw.testRandomness();
                    }
                        break;
                }

            });

        });
    })();

    (function () {
        const editorHostEl = document.getElementById('wheel');

        function createSpeedRangeEditor(speedObj, idName, label) {

            const { 'range-min': min, 'range-max': max, value } = speedObj;

            const rangeSetup = {
                min,
                max,
                values: [min, min + ((max - min) / 2), max]
            };

            DomUtils.createRangeEditor(speedObj, 'value', editorHostEl, label, idName, rangeSetup);
        }

        DomUtils.createColorEditor(wheelData, 'flashing-color', editorHostEl, 'Flashing Color:', 'flashing-color');
        createSpeedRangeEditor(wheelData['flashing-time'], 'wheel-flashing-time', 'Flashing Time:');

        createSpeedRangeEditor(wheelData['speed-min'], 'wheel-speed-min', 'Speed Min:');
        createSpeedRangeEditor(wheelData['speed-max'], 'wheel-speed-max', 'Speed Max:');
    })();

    (function () {
        const hostEl = document.querySelector('#page');
        const style = getComputedStyle(document.body);
        const page = {
            color: rgbToHex(style.backgroundColor),
            update() {
                document.body.style.backgroundColor = this.color;
            }
        };

        const savedBgColor = localStorage.getItem('bg-color');
        if (savedBgColor !== null) {
            page.color = rgbToHex(savedBgColor);
        }

        page.update();

        DomUtils.createColorEditor(page, 'color', hostEl, 'Page Color:', 'page-bg-color', () => {
            page.update();
        });

        document.querySelector('#save-settings').addEventListener('click', () => {
            localStorage.setItem('bg-color', document.body.style.backgroundColor);
            localStorage.setItem('fortune-wheel-config', JSON.stringify(wheelData));
            location.reload();
        });

        document.querySelector('#load-settings').addEventListener('click', () => {
            location.reload();
        });

        document.querySelector('#export-settings').addEventListener('click', () => {
            const json = JSON.stringify(wheelData, null, 2);
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

        function createEditorUi(selectedVisualItem, key) {
            const range0to100by10 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

            switch (key) {
                case 'visible':
                    DomUtils.createCheckBoxEditor(selectedVisualItem, key, editorHostEl, 'visibility', 'Visible:');
                    break;

                case 'color':
                    DomUtils.createColorEditor(selectedVisualItem, key, editorHostEl, 'Color:', 'color');
                    break;

                case 'scale': {
                    const rangeSetup = {
                        min: 0,
                        max: 100,
                        values: range0to100by10
                    };
                    DomUtils.createRangeEditor(selectedVisualItem, key, editorHostEl, 'Scale:', 'scale', rangeSetup);
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
                        DomUtils.createRangeEditor(selectedVisualItem, key, editorHostEl, 'Offset:', 'offset', rangeSetup);
                    } else {
                        const rangeSetup = {
                            min: 0,
                            max: 100,
                            values: range0to100by10
                        };
                        DomUtils.createRangeEditor(selectedVisualItem, key, editorHostEl, 'Offset:', 'offset', rangeSetup);
                    }
                }
                    break;

                case 'text':
                    DomUtils.createTextEditor(selectedVisualItem, key, editorHostEl, 'Text:', 'text');
                    break;
            }

            if (isObject(selectedVisualItem[key])) {
                switch (key) {
                    case 'shadow': {
                        DomUtils.createSection('Shadow', editorHostEl);

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

                        DomUtils.createColorEditor(selectedVisualItem.shadow, 'color', editorHostEl, 'Color:', 'shadow-color');
                        DomUtils.createRangeEditor(selectedVisualItem.shadow, 'blur', editorHostEl, 'Blur:', 'shadow-blur', rangeSetupBlur);
                        DomUtils.createRangeEditor(selectedVisualItem.shadow, 'offsetx', editorHostEl, 'Offset X:', 'shadow-offsetx', rangeSetupOffsets);
                        DomUtils.createRangeEditor(selectedVisualItem.shadow, 'offsety', editorHostEl, 'Offset Y:', 'shadow-offsety', rangeSetupOffsets);
                    }
                        break;

                    case 'outline':
                        DomUtils.createColorEditor(selectedVisualItem.outline, 'color', editorHostEl, 'Outline Color:', 'outline-color');
                        break;

                    case 'inner': {
                        const rangeSetup = {
                            min: 0,
                            max: 1,
                            values: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                            step: 0.1
                        };
                        DomUtils.createColorEditor(selectedVisualItem.inner, 'color', editorHostEl, 'Inner Color:', 'inner-color');
                        DomUtils.createRangeEditor(selectedVisualItem.inner, 'alpha', editorHostEl, 'Inner Color Alpha:', 'inner-color-alpha', rangeSetup);
                    }
                        break;

                    case 'stroke': {
                        DomUtils.createSection('Stroke', editorHostEl);

                        const rangeSetup = {
                            min: 0,
                            max: 10,
                            values: [0, 5, 10, 15, 20],
                        };
                        DomUtils.createCheckBoxEditor(selectedVisualItem.stroke, 'visible', editorHostEl, 'stroke-visibility', 'Stroke Visible:');
                        DomUtils.createColorEditor(selectedVisualItem.stroke, 'color', editorHostEl, 'Stroke Color:', 'stroke-color');
                        DomUtils.createRangeEditor(selectedVisualItem.stroke, 'width', editorHostEl, 'Stroke Width:', 'stroke-width', rangeSetup);
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

})(TCSColors);
