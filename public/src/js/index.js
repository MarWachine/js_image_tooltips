/* TO DO:
 *
 * Back-end:
 *          Canvas:
 *                  Define pixel areas and info texts for every image
 *                      --> idea:   mask image with transparent bg canvas that allows drawing
 *                      -->         drawn pixels will be interpreted and saved as info areas
 *                  "Undo" functionality that removes the last drawn line (save btnDown - btnUp increments as coord objects into arrays?)
 * 
 *          UI:     Buttons:
 *                      --> Upload: Load Image into back-end canvas
 *                      --> Edit:   Edit existing entries (which will then be loaded into back-end canvas with their defined pixel areas)
 *                      --> Delete: Delete existing entries
 *                      --> Undo:   Button for canvas functionality
 *                      --> Save:   Save changes (into existing JSON file?), add image to front-end gallery
 *                      --> Create new containers on click for additional pixel areas and info texts
 * 
 * Front-end:
 *          Canvas:     
 *                  Load images from back-end
 *                  Hovering over pre-defined ares will return a respective text info
 *                  Develop responsive sizing solution (and adapt existing pixel area values to new size)
 *                  Implement function to load data for interactive description
 * 
 * Data:
 *          Save as JSON?
 *          Store on CouchDB?
 */

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

    // To do: Implement function to load data for interactive description
    // e.g. loadLegend();
}

/*
    const loadLegend = () => {

    }
*/

// DCL INIT
const init = () => {
    domMapping();
    appendEventlisteners();
    initCanvas();
    render();
}

window.addEventListener("load", init);
