function getRandom(lower, upper) {
    return Math.floor(lower + (Math.random() * (upper - lower + 1)));
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgbString) {
    const tmp = rgbString.replace('rgb(', '').replace(')', '');
    const arr = tmp.split(',');
    const r = parseInt(arr[0], 10);
    const g = parseInt(arr[1], 10);
    const b = parseInt(arr[2], 10);

    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function deg2rad(degrees) {
    return degrees * (Math.PI / 180);
}

function rad2deg(radians) {
    return radians * (180 / Math.PI);
}

function rotatePointCenter(x, y, degrees) {

    const radians = deg2rad(degrees);

    const rx = Math.cos(radians) * x - Math.sin(radians) * y;
    const ry = Math.sin(radians) * x + Math.cos(radians) * y;

    return {
        x: rx,
        y: ry
    };
}

function rotatePoint(x, y, cx, cy, degrees) {

    const radians = deg2rad(degrees);

    const rx = Math.cos(radians) * (x - cx) - Math.sin(radians) * (y - cy) + cx;
    const ry = Math.sin(radians) * (x - cx) + Math.cos(radians) * (y - cy) + cy;

    return {
        x: rx,
        y: ry
    };
}

function pointInCircle(x, y, cx, cy, radius) {
    const distancesquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distancesquared <= radius * radius;
}

function toKebabCase(str) {
    return str && str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');
}
