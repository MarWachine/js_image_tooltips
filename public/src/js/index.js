'use strict';

import dom from './dom.js';
import elements from './settings.js';
import { rnd } from './helpers.js';

// CONSTANTS / VARIABLES

// BASIC
const domMapping = () => {
    elements.canvas = dom.$('canvas');
    elements.imgTest = dom.$('#imgTest');
}

const appendEventlisteners = () => {
}

// CORE 

const initCanvas = () => {
    const c = elements.canvas;
    // Declare canvas width / height                                                    <-- To do: Develop responsive sizing solution
    c.width = 1280;
    c.height = 768;
}

const render = () => {
    const c = elements.canvas;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    const thisImg = elements.imgTest;                                                   // To do: Load image from back-end instead

    // Scale, center, and draw the loaded image depending on its format

    // Portrait mode
    if (thisImg.width <= thisImg.height) {
        let newImgWidth = thisImg.width * (c.height / thisImg.height);
        let marginX = (c.width - newImgWidth) / 2;
        ctx.drawImage(
            thisImg,
            marginX,
            0,
            newImgWidth,
            c.height
        )
    }

    // Landscape mode
    else {
        let newImgHeight = thisImg.height * (c.width / thisImg.width);
        let marginY = (c.width - newImgWidth) / 2;
        ctx.drawImage(
            thisImg,
            0,
            marginY,
            c.width,
            newImgHeight
        )
    }
}

// DCL INIT
const init = () => {
    domMapping();
    appendEventlisteners();
    initCanvas();
    render();
}

window.addEventListener("load", init);
