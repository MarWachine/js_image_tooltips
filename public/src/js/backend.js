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
let size = 20;
let color = 'rgb(0, 0, 0)';
let usedColors = [];
let lastPos = false;
let pressed = false;
let colorsLocked = false;
let publishedImages = [];


// BASIC ----------------------------------------------------------------------------------------------------

const domMapping = () => {
    //Frontend
    elements.canvasFE = dom.$('#cFE');
    elements.content = dom.$('#content');
    elements.infoP = dom.$('#infoP');
    // _________________________________________
    elements.activeColor = dom.$('.activeColor');
    elements.btnNewArea = dom.$('#btnNewArea');
    elements.btnSave = dom.$('#btnSave');
    elements.canvasBE = dom.$('#cImgLoad');
    elements.divCBE = dom.$('#divCBE');
    elements.divInfo = dom.$('#divInfo');
    elements.divPublished = dom.$('#divPublished');
    elements.fileUpload = dom.$('#fileUpload');
    elements.gallery = dom.$('#gallery');
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
    elements.btnSave.addEventListener('click', publishImage);
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
    thisImg.addEventListener('load', () => {
        // Portrait mode
        if (thisImg.width / thisImg.height < 16 / 9) {
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
    for (let inputC of elements.inputColor) {
        inputC.addEventListener('click', setBrushColor);
        inputC.classList.add('inputColor');
        inputC.classList.remove('inputColorBlocked');
    }
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
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
}

const drawArea = evt => {
    const c = elements.currentLayer;
    const ctx = c.getContext('2d');

    ctx.fillStyle = `${color}`;
    ctx.lineWidth = size;

    if (lastPos && pressed) {
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(evt.layerX, evt.layerY);
        ctx.arc(evt.layerX, evt.layerY, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        if (!colorsLocked) lockBrushColors();
    }

    lastPos = { x: evt.layerX, y: evt.layerY };
}

const initMask = () => {
    const newMask = dom.create({
        type: 'canvas',
        parent: elements.divCBE,
        classes: ['cMask'],
        attr: { 'id': '#currentLayer' },
        amEnde: false
    });
    newMask.width = 800;
    newMask.height = 450;
    newMask.addEventListener('mousemove', drawArea);
    newMask.addEventListener('mousedown', btnDown);
    newMask.addEventListener('mouseup', btnUp);
    elements.currentLayer = newMask;
    return newMask;
}

const saveMask = () => {
    const c = dom.$('.cMask');
    const ctx = c.getContext('2d');
    const data = ctx.getImageData(0, 0, c.width, c.height);
    let pText = 'This is an example info text.'
    if (dom.$('#taInfo').value) pText = dom.$('#taInfo').value;
    printLayer(color, pText, c);
}

const resetMask = () => {
    const c = elements.currentLayer;
    c.remove();
    dom.$('#taInfo').value = '';
    dom.$('#inputSize').value = size;
    initMask();
}

const printLayer = (color, pText, canvas) => {
    const newLayer = dom.create({ type: 'div', parent: elements.divInfo, classes: ['container', 'divNewLayer'] });
    const newLayerImgDiv = dom.create({ type: 'div', classes: ['divLayerImg'] });
    const newLayerContent = dom.create({ type: 'div', classes: ['divLayerContent'] });
    const newLayerX = dom.create({ type: 'div', classes: ['divLayerX'] })
    newLayer.append(newLayerImgDiv);
    newLayer.append(newLayerContent);
    newLayer.append(newLayerX);
    const c = dom.create({ type: 'canvas', parent: newLayerImgDiv, classes: ['cThumb'], attr: { 'width': '160px', 'height': '90px' } });
    const ctx = c.getContext('2d');
    ctx.scale(0.2, 0.2);
    ctx.drawImage(canvas, 0, 0);
    dom.create({ content: pText, type: 'p', parent: newLayerContent, classes: ['infoText'] });
    const btnDelete = dom.create({ content: 'X', type: 'button', parent: newLayerX, classes: ['btnDelete'] });
    btnDelete.addEventListener('click', () => newLayer.remove());
    usedColors.push(color);
    return newLayer;
}

const publishImage = () => {
    let layers = [...dom.$$('.divNewLayer')];
    let texts = [...dom.$$('.infoText')];
    let areas = [...dom.$$('.cThumb')];

    const img = {};
    img.url = '/uploads/' + imgName;
    img.areas = [];
    if (imgName != 'img' && layers.length) {
        for (let el of layers) {
            let layerID = layers.indexOf(el);
            const area = {};
            area.id = layerID + 1;
            area.text = texts[layerID].innerHTML;
            area.data = [];
            // push array with layer canvas' alpha values
            let c = areas[layerID];
            let ctx = c.getContext('2d');
            let imgData = ctx.getImageData(0, 0, c.width, c.height);
            for (let i = 0; i < imgData.data.length; i += 4) {
                if (i % (imgData.width * 4) == 0) area.data.push([]);
                area.data[area.data.length - 1].push(Number(imgData.data[i + 3] < 250));
            }
            img.areas.push(area);
        }
        publishedImages.push(img);
        console.log(img);
        console.log(publishedImages);
    }
    printToGallery();
    resetBackEnd();
}

const printToGallery = () => {
    if (publishedImages.length) {
        let existingImages = [...dom.$$('.publishedImg')];
        for (let el of existingImages) el.remove();
        for (let el of publishedImages) {
            let img = el.url;
            const publishedImg = dom.create({
                type: 'canvas',
                parent: elements.gallery,
                classes: ['publishedImg'],
                attr: { 'width': '160px', 'height': '90px' }
            });
            console.log(img);
            render(publishedImg, img)
            publishedImg.addEventListener('click', () => loadFromThumbnail(publishedImg));
        }
    }
}


const loadFromThumbnail = evt => {
    initCanvasFE();
    const c = dom.$('#cFE');
    const ctx = c.getContext('2d');
    ctx.scale(8, 8);
    ctx.drawImage(evt, 0, 0);
    c.addEventListener('mousemove', () => compareAreas(c, evt));
}

const compareAreas = (c, evt) => {
    console.log('Compare');
    lastPos = { x: c.layerX, y: c.layerY };
    if (lastPos) {
        console.log(lastPos);
        for (let el of publishedImages) {
            if (el.url == evt.src) {
                for (let x in el.area.data) {
                    if (lastPos.x == x) {
                        for (let y in x) {
                            if (lastPos.y == y) {
                                if (!y) {
                                    updateInfoBox(el.area.text);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

const updateInfoBox = info => {
    elements.infoP.innerHTML = info;
}

const resetBackEnd = () => {
    for (let el of [...dom.$$('.divNewLayer')]) el.remove();
    dom.$('#inputFile').value = '';
    initCanvasBE();
    initMask();
}


// FRONT-END FUNCTIONS
const initCanvasFE = () => {
    const c = elements.canvasFE;
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
}

const render = (c, img) => {
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    const thisImg = document.createElement('img');
    thisImg.src = img;

    // Portrait mode
    if (thisImg.width / thisImg.height <= 16 / 9) {
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
}


// DCL INIT ----------------------------------------------------------------------------------------------

const init = () => {
    domMapping();
    //Frontend
    initCanvasFE();
    //render();
    //
    initCanvasBE();
    initMask();
    appendEventlisteners();
    printBrushSize();
    printBrushColor();
}

window.addEventListener("load", init);
