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
*/


// MODULES --------------------------------------------------------------------------------------------------

import dom from './dom.js';
import { elements } from './settings.js';
// import { rnd } from './helpers.js';


// CONSTANTS / VARIABLES ------------------------------------------------------------------------------------

let imgName = 'img';
let idCount = 1;
let size = 10;
let color = 'rgb(0, 0, 0)';
let usedColors = [];
let lastPos = false;
let pressed = false;
let colorsLocked = false;


// BASIC ----------------------------------------------------------------------------------------------------

const domMapping = () => {
    elements.activeColor = dom.$('.activeColor');
    elements.btnNewArea = dom.$('#btnNewArea');
    elements.btnRedo = dom.$('#btnRedo');
    elements.btnSave = dom.$('#btnSave');
    elements.btnUndo = dom.$('#btnUndo');
    elements.divCBE = dom.$('#divCBE');
    elements.divInfo = dom.$('#divInfo');
    elements.fileUpload = dom.$('#fileUpload');
    elements.canvasBE = dom.$('#cImgLoad');
    elements.inputColor = dom.$$('.inputColor');
    elements.inputSize = dom.$('#inputSize');
    elements.pColor = dom.$('#pColor');
    elements.pSize = dom.$('#pSize');
    elements.taInfo = dom.$('#taInfo');
}

const appendEventlisteners = () => {
    elements.btnNewArea.addEventListener('click', handleNewArea);
    for (let inputC of elements.inputColor) inputC.addEventListener('click', setBrushColor);
    elements.inputSize.addEventListener('change', setBrushSize);
    elements.fileUpload.addEventListener('submit', handleSubmit);
    elements.btnNewArea.addEventListener('click', handleNewArea);
}


// CONTROLS --------------------------------------------------------------------------------------------------

const btnDown = () => pressed = true;
const btnUp = () => pressed = false;


// DATA UPLOAD -----------------------------------------------------------------------------------------------

const handleSubmit = evt => {

    evt.preventDefault();

    // Transporting formular data via POST
    fetch('/upload_data', {
        method: 'post',
        body: new FormData(elements.fileUpload)
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
    imgName = img;

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


// UI ------------------------------------------------------------------------------------------------------

const printBrushSize = () => {
    elements.pSize.innerHTML = `Brush Size: ${size}`;
}

const setBrushSize = evt => {
    size = Number(evt.target.value);
    printBrushSize();
}

const printBrushColor = () => {
    elements.pColor.innerHTML = `Brush Color: ${color}`;
}

const setBrushColor = evt => {
    color = window.getComputedStyle(evt.target, null).getPropertyValue('background-color');
    elements.activeColor.classList.remove('activeColor');
    evt.target.classList.add('activeColor');
    elements.activeColor = dom.$('.activeColor');
    printBrushColor();
}

const lockBrushColors = () => {
    for (let inputC of elements.inputColor) {
        inputC.removeEventListener('click', setBrushColor);
        let thisColor = window.getComputedStyle(inputC, null).getPropertyValue('background-color');
        if (thisColor != color) {
            inputC.classList.add('inputColorBlocked');
            inputC.classList.remove('inputColor');
        }
    }
    colorsLocked = true;
}

const unlockBrushColors = () => {
            inputC.addEventListener('click', setBrushColor);
            inputC.classList.add('inputColor');
            inputC.classList.remove('inputColorBlocked');
            colorsLocked = false;
    }

const handleNewArea = () => {
    saveMask();
    resetMask();
    unlockBrushColors();
}

// CANVAS -------------------------------------------------------------------------------------------------

const initCanvasBE = () => {
    const c = elements.canvasBE;
    c.width = 800;
    c.height = 450;
}

const drawArea = evt => {
    const c = elements.currentLayer;
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
        if(!colorsLocked) lockBrushColors();
    }

    lastPos = { x: evt.layerX, y: evt.layerY };
}

const initMask = () => {
    const newMask = dom.create({
        type: 'canvas',
        parent: elements.divCBE,
        classes: ['cMask'],
        attr: {'id': '#currentLayer'},
        amEnde: false
    });
    newMask.width = 800;
    newMask.height = 450;
    newMask.addEventListener('mousemove', drawArea);
    newMask.addEventListener('mousedown', btnDown);
    newMask.addEventListener('mouseup', btnUp);
    console.log(newMask);
    elements.currentLayer = newMask;
    return newMask;
}

const saveMask = () => {
    const c = dom.$('.cMask');
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const pText = 'This is an example info text.'
    if (elements.taInfo.innerText) pText = elements.taInfo.innerText;
    const pxData = JSON.stringify(data);
    printLayer(color, pText);
}

const resetMask = () => {
    const c = dom.$('#currentLayer');
    c.removeAttribute('id');                // "c is null"
    initMask();
}

const printLayer = (color, pText) => {
    const layerID = String(imgName + idCount);
    const newLayer = dom.create({type: 'div', parent: elements.divInfo, classes: ['container']});
    const newLayerColor = dom.create({type: 'div', classes: ['layerColor'], styles: {'background-color': color}});
    const newLayerContent = dom.create({type: 'div', classes: ['divLayerContent']});
    newLayer.append(newLayerColor);
    newLayer.append(newLayerContent);
    dom.create({content: layerID, type: 'h3', parent: newLayerContent});
    dom.create({content: pText, type: 'p', parent: newLayerContent, classes: ['infoText']});
    usedColors.push(color);
    idCount++
    return newLayer;
}


// DCL INIT ----------------------------------------------------------------------------------------------

const init = () => {
    domMapping();
    initCanvasBE();
    initMask();
    appendEventlisteners();
    printBrushSize();
    printBrushColor();
}

window.addEventListener("load", init);
