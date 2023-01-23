'use strict';

const formidable = require('formidable');
const express = require('express');
const server = express();

server.use(express.static('public', {
    extensions: ['html']
}));

// ROUTING
server.post('/upload_data', (request, response) => {
    // Prepare data processing
    const fileUpload = formidable({
        uploadDir: 'public/uploads',
        keepExtensions: true,
    })

    // Process uploaded data
    fileUpload.parse(request, (err, fields, files) => {
        if (err) console.warn(err);
        else {
            console.log(files);
        }
        response.send(files.inputFile.newFilename);
    })
})

const init = () => {
    server.listen(80, err => console.log(err || 'Server running'));
}

init();