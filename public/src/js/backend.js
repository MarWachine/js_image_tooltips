'use strict';

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
 *                  Optional: Develop responsive sizing solution (and adapt existing pixel area values to new size)
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
let color = 'rgba(0, 0, 0, 0)';
let size = 5;
let lastPos = false;
let pressed = false;


// BASIC
const domMapping = () => {
    elements.canvasBE = dom.$('#cImgLoad');
    elements.inputColor = dom.$$('.inputColor');
    elements.inputSize = dom.$('#inputSize');
    console.log(elements);
}

const appendEventlisteners = () => {
    elements.canvasBE.addEventListener('mousemove', drawArea);
    elements.canvasBE.addEventListener('mousedown', btnDown);
    elements.canvasBE.addEventListener('mouseup', btnUp);
    elements.inputColor.addEventListener('click', setBrushColor);
    elements.inputSize.addEventListener('change', setBrushSize);
}


// CONTROLS

const btnDown = () => pressed = true;
const btnUp = () => pressed = false;


// CORE
const initCanvasBE = () => {
    const c = elements.canvasBE;
    // Declare canvas width / height                                                    <-- Optional: Develop responsive sizing solution
    c.width = 800;
    c.height = 450;
}


// BACK-END FUNCTIONS

const setBrushColor = evt => {
    color = evt.target.value;
}

const setBrushSize = evt => {
    size = Number(evt.target.value);
}

const drawArea = evt => {
    const c = elements.canvasBE;
    const ctx = c.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
   
    if (lastPos && pressed) {
     ctx.beginPath();
     ctx.moveTo(lastPos.x, lastPos.y);
     ctx.lineTo(evt.layerX, evt.layerY);
     ctx.stroke();
    }

    lastPos = { x: evt.layerX, y: evt.layerY };
}

// DCL INIT
const init = () => {
    domMapping();
    initCanvasBE();
    render();
    appendEventlisteners();
}

window.addEventListener("load", init);
