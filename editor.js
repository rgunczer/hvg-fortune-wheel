(function () {

    (function () {
        ['flashing-color', 'flashing-time', 'speed-min', 'speed-max'].forEach(id => {
            const elem = document.querySelector('#' + id);
            elem.value = wheelData[id];

            elem.addEventListener('change', (event) => {
                console.log(`${id} changed`, event.target.value);
                wheelData[id] = elem.value;
            });
        });
    })();

    (function () {
        const showHideButtonId = 'show-hide-editor';
        const showHideDebugButtonId = 'show-hide-debug';
        const testRandomnessButtonId = 'test-randomness';
        [showHideButtonId, showHideDebugButtonId, testRandomnessButtonId].forEach(buttonId => {

            document.querySelector('#' + buttonId).addEventListener('click', (event) => {

                const id = event.target.getAttribute('id');

                switch (id) {
                    case showHideButtonId: {
                        const elem = document.getElementById('editor');
                        showHideElement(elem);
                    }
                        break;

                    case showHideDebugButtonId: {
                        const elem = document.getElementById('dump');
                        showHideElement(elem);
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
        const bgColorElem = document.querySelector('#page-bg-color');
        const style = getComputedStyle(document.body);
        bgColorElem.value = rgbToHex(style.backgroundColor);
        bgColorElem.addEventListener('change', (event) => {
            console.log('page background color changed', event.target.value);
            document.body.style.backgroundColor = bgColorElem.value;
        });

        const pageBgColor = localStorage.getItem('bg-color');
        if (pageBgColor !== null) {
            document.body.style.backgroundColor = pageBgColor;
            bgColorElem.value = rgbToHex(document.body.style.backgroundColor);
        }

        document.querySelector('#save-settings').addEventListener('click', () => {
            localStorage.setItem('bg-color', document.body.style.backgroundColor);
        });

        document.querySelector('#load-settings').addEventListener('click', () => {
            document.body.style.backgroundColor = localStorage.getItem('bg-color');
            bgColorElem.value = rgbToHex(document.body.style.backgroundColor);
        });
    })();

    (function () {
        const editorHostElem = document.querySelector('#editor-host');
        const visualsListElem = document.querySelector('#wheel-visuals');

        let selectedVisualItem = null;

        function getWheelVisualOptions() {
            let html = '';
            Object.keys(wheelData.visuals).sort().forEach(key => {
                html += `<option value='${key}'>${key}</option>`;
            });
            return html;
        }

        function visibilityCheckedHandler(event) {
            selectedVisualItem.visible = event.target.checked;
        }

        function colorChangeHandler(event) {
            selectedVisualItem.color = event.target.value;
        }

        function scaleInputHandler(event) {
            selectedVisualItem.scale = event.target.value;
        }

        function offsetInputHandler(event) {
            selectedVisualItem.offset = event.target.value;
        }

        function textInputHandler(event) {
            selectedVisualItem.text = event.target.value;
        }

        function shadowColorInputHandler(event) {
            selectedVisualItem.shadow.color = event.target.value;
        }

        function shadowBlurInputHandler(event) {
            selectedVisualItem.shadow.blur = event.target.value;
        }

        function shadowOffsetXInputHandler(event) {
            selectedVisualItem.shadow.offsetx = event.target.value;
        }

        function shadowOffsetYInputHandler(event) {
            selectedVisualItem.shadow.offsety = event.target.value;
        }

        function outlineColorInputHandler(event) {
            selectedVisualItem.outline.color = event.target.value;
        }

        function innerColorInputHandler(event) {
            selectedVisualItem.inner.color = event.target.value;
        }

        function innerColorAlphaInputHandler(event) {
            selectedVisualItem.inner.alpha = event.target.value;
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

        function createColorEditor(currentValue, hostElem, labelText, idAndName, eventHandlerFn) {
            const divElem = createElemWithClass('div', 'input');
            hostElem.appendChild(divElem);

            const labelElement = createLabel(labelText, idAndName);
            divElem.appendChild(labelElement);

            const inputElement = document.createElement('input');
            inputElement.type = 'color';
            inputElement.name = idAndName;
            inputElement.id = idAndName;
            divElem.appendChild(inputElement);

            inputElement.value = currentValue;

            inputElement.addEventListener('change', eventHandlerFn);
        }

        function createRangeEditor(currentValue, hostElem, labelText, idAndName, rangeProps, eventHandlerFn) {
            const divElem = createElemWithClass('div', 'input');
            hostElem.appendChild(divElem);

            const labelElement = createLabel(labelText, idAndName);
            divElem.appendChild(labelElement);

            const datalistElem = document.createElement('datalist');
            datalistElem.id = "tickmarks-" + idAndName;

            let options = '';
            rangeProps.values.forEach(value => {
                options += `<option value="${value}" />`;
            });

            datalistElem.innerHTML = options;

            divElem.appendChild(datalistElem);

            const inputElement = document.createElement('input');
            inputElement.type = 'range';
            inputElement.name = idAndName;
            inputElement.id = idAndName;
            inputElement.min = rangeProps.min;
            inputElement.max = rangeProps.max;

            if (rangeProps.step) {
                inputElement.step = rangeProps.step;
            }

            // inputElement.list = dataListElem; // not working, SO
            inputElement.setAttribute('list', datalistElem.id);

            divElem.appendChild(inputElement);

            inputElement.value = currentValue;

            inputElement.addEventListener('input', eventHandlerFn);
        }

        function createCheckBoxEditor(currentValue, hostElem, idName, labelText, eventHandlerFn) {
            const divElement = createElemWithClass('div', 'input');
            hostElem.appendChild(divElement);

            const labelElement = createLabel(labelText, idName);
            divElement.appendChild(labelElement);

            const inputElement = document.createElement('input');
            inputElement.type = 'checkbox';
            inputElement.name = idName;
            inputElement.id = idName;

            divElement.appendChild(inputElement);

            inputElement.checked = currentValue;

            inputElement.addEventListener('change', eventHandlerFn);
        }

        function createTextEditor(currentValue, hostElem, labelText, idName, eventHandlerFn) {
            const divElement = createElemWithClass('div', 'input');
            hostElem.appendChild(divElement);

            const labelElement = createLabel(labelText, idName);
            divElement.appendChild(labelElement);

            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.name = idName;
            inputElement.id = idName;

            divElement.appendChild(inputElement);

            inputElement.value = currentValue;

            inputElement.addEventListener('input', eventHandlerFn);
        }

        function createEditorUi(key) {
            const range0to100by10 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

            switch (key) {
                case 'visible':
                    createCheckBoxEditor(selectedVisualItem.visible, editorHostElem, 'visibility', 'Visible:', visibilityCheckedHandler);
                    break;

                case 'color':
                    createColorEditor(selectedVisualItem.color, editorHostElem, 'Color:', 'color', colorChangeHandler);
                    break;

                case 'scale': {
                    const rangeSetup = {
                        min: 0,
                        max: 100,
                        values: range0to100by10
                    };
                    createRangeEditor(selectedVisualItem.scale, editorHostElem, 'Scale:', 'scale', rangeSetup, scaleInputHandler);
                }
                    break;

                case 'offset': {
                    if (selectedVisualItem.hasOwnProperty('offset-max')) {
                        const offsetMax = selectedVisualItem['offset-max'];
                        const rangeSetup = {
                            min: 0,
                            max: offsetMax,
                            values: [0, offsetMax * 0.25, offsetMax * 0.5 , offsetMax * 0.75, offsetMax]
                        };
                        createRangeEditor(selectedVisualItem.offset, editorHostElem, 'Offset:', 'offset', rangeSetup, offsetInputHandler);
                    } else {
                        const rangeSetup = {
                            min: 0,
                            max: 100,
                            values: range0to100by10
                        };
                        createRangeEditor(selectedVisualItem.offset, editorHostElem, 'Offset:', 'offset', rangeSetup, offsetInputHandler);
                    }
                }
                    break;

                case 'text':
                    createTextEditor(selectedVisualItem.text, editorHostElem, 'Text:', 'text', textInputHandler);
                    break;
            }

            if (isObject(selectedVisualItem[key])) {
                switch (key) {
                    case 'shadow': {
                        const hrElem = document.createElement('hr');
                        editorHostElem.appendChild(hrElem);

                        const h4Elem = document.createElement('h4');
                        h4Elem.style.paddingBottom = '10px';
                        h4Elem.innerHTML = 'Shadow';
                        editorHostElem.appendChild(h4Elem);

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

                        createColorEditor(selectedVisualItem.shadow.color, editorHostElem, 'Color:', 'shadow-color', shadowColorInputHandler);
                        createRangeEditor(selectedVisualItem.shadow.blur, editorHostElem, 'Blur:', 'shadow-blur', rangeSetupBlur, shadowBlurInputHandler);
                        createRangeEditor(selectedVisualItem.shadow.offsetx, editorHostElem, 'Offset X:', 'shadow-offsetx', rangeSetupOffsets, shadowOffsetXInputHandler);
                        createRangeEditor(selectedVisualItem.shadow.offsety, editorHostElem, 'Offset Y:', 'shadow-offsety', rangeSetupOffsets, shadowOffsetYInputHandler);
                    }
                        break;

                    case 'outline':
                        createColorEditor(selectedVisualItem.outline.color, editorHostElem, 'Outline Color:', 'outline-color', outlineColorInputHandler);
                        break;

                    case 'inner': {
                        const rangeSetup = {
                            min: 0,
                            max: 1,
                            values: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                            step: 0.1
                        };
                        createColorEditor(selectedVisualItem.inner.color, editorHostElem, 'Inner Color:', 'inner-color', innerColorInputHandler);
                        createRangeEditor(selectedVisualItem.inner.alpha, editorHostElem, 'Inner Color Alpha:', 'inner-color-alpha', rangeSetup, innerColorAlphaInputHandler);
                    }
                        break;
                }
            }
        }

        visualsListElem.innerHTML = getWheelVisualOptions();

        visualsListElem.addEventListener('change', (event) => {
            const visualItemName = event.target.value;
            selectedVisualItem = wheelData.visuals[visualItemName];

            while (editorHostElem.firstChild) {
                editorHostElem.removeChild(editorHostElem.firstChild);
            }

            Object.keys(selectedVisualItem).forEach(key => {
                if (selectedVisualItem.hasOwnProperty(key)) {
                    createEditorUi(key);
                }
            });
        });

    })();

})();
