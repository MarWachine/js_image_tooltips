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
import { elements } from './settings.js';
// import { rnd } from './helpers.js';


// CONSTANTS / VARIABLES
let size = 10;
let color = 'rgb(0, 0, 0)';
let lastPos = false;
let pressed = false;


// BASIC
const domMapping = () => {
    elements.activeColor = dom.$('.activeColor');
    elements.fileUpload = dom.$('#fileUpload');
    elements.canvasBE = dom.$('#cImgLoad');
    elements.inputColor = dom.$$('.inputColor');
    elements.inputSize = dom.$('#inputSize');
    elements.pColor = dom.$('#pColor');
    elements.pSize = dom.$('#pSize');
}

const appendEventlisteners = () => {
    elements.canvasBE.addEventListener('mousemove', drawArea);
    elements.canvasBE.addEventListener('mousedown', btnDown);
    elements.canvasBE.addEventListener('mouseup', btnUp);
    for (let inputC of elements.inputColor) inputC.addEventListener('click', setBrushColor);
    elements.inputSize.addEventListener('change', setBrushSize);
    elements.fileUpload.addEventListener('submit', handleSubmit);
}


// CONTROLS
const btnDown = () => pressed = true;
const btnUp = () => pressed = false;


// DATA UPLOAD
const handleSubmit = evt => {

    evt.preventDefault();

    // Transporting formular data via POST
    fetch('/upload_data', {
        method: 'post',
        body: new FormData(elements.fileUpload)     // Generating and sending data with FormData constructor
    }).then(
        res => res.text()
    ).then(
        renderImgUpload
    ).catch(
        console.warn
    )
}

const renderImgUpload = img => {
    const c = elements.canvasBE;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    // Load image from "uploads" folder
    const thisImg = document.createElement('img');
    thisImg.src = '/uploads/' + img;

    console.log(thisImg);
    thisImg.addEventListener('load', () => {
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
            let marginY = (c.height - newImgHeight) / 2;
            ctx.drawImage(
                thisImg,
                0,
                marginY,
                c.width,
                newImgHeight
            )
        }
    })

}


// BACK-END FUNCTIONS
const initCanvasBE = () => {
    const c = elements.canvasBE;
    // Declare canvas width / height                                                    <-- Optional: Develop responsive sizing solution
    c.width = 800;
    c.height = 450;
}

const setBrushColor = evt => {
    color = window.getComputedStyle(evt.target, null).getPropertyValue('background-color');
    elements.activeColor.classList.remove('activeColor');
    evt.target.classList.add('activeColor');
    elements.activeColor = dom.$('.activeColor');
    printBrushColor();
}

const setBrushSize = evt => {
    size = Number(evt.target.value);
    printBrushSize();
}

const drawArea = evt => {
    const c = elements.canvasBE;
    const ctx = c.getContext('2d');

    ctx.fillStyle = `${color}`;
    ctx.lineWidth = size;

    if (lastPos && pressed) {
        ctx.beginPath();
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(evt.layerX, evt.layerY);
        ctx.arc(evt.layerX, evt.layerY, size / 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    lastPos = { x: evt.layerX, y: evt.layerY };
}

// UI
const printBrushColor = () => {
    elements.pColor.innerHTML = `Brush Color: ${color}`;
}

const printBrushSize = () => {
    elements.pSize.innerHTML = `Brush Size: ${size}`;
}

// DCL INIT
const init = () => {
    domMapping();
    initCanvasBE();
    appendEventlisteners();
    printBrushSize();
    printBrushColor();
}

window.addEventListener("load", init);
