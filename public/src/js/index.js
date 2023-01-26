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
 *                  Hovering over pre-defined areas will return a respective text info
 *                  Develop responsive sizing solution (and adapt existing pixel area values to new size)
 *                  Implement function to load data for interactive description
 * 
 * Data:
 *          Save as JSON?
 *          Store on CouchDB?
*/

'use strict';

import dom from './dom.js';
import {elements} from './settings.js';
// import { rnd } from './helpers.js';


// CONSTANTS / VARIABLES


// BASIC
const domMapping = () => {
    elements.canvasFE = dom.$('#cFE');
    elements.content = dom.$('#content');
    console.log(elements);
}

const appendEventlisteners = () => {
}

// CORE
const initCanvasFE = () => {
    const c = elements.canvasFE;
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
}


// FRONT-END FUNCTIONS
const render = img => {
    const c = elements.canvasFE;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);                                             

    // Portrait mode
    if (img.width <= img.height) {
        let newImgWidth = img.width * (c.height / img.height);
        let marginX = (c.width - newImgWidth) / 2;
        ctx.drawImage(
            img,
            marginX,
            0,
            newImgWidth,
            c.height
        )
    }

    // Landscape mode
    else {
        let newImgHeight = img.height * (c.width / img.width);
        let marginY = (c.width - newImgWidth) / 2;
        ctx.drawImage(
            img,
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
    initCanvasFE();
    render();
    appendEventlisteners();
}

window.addEventListener("load", init);
