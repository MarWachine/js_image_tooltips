'use strict';

// MODULE
const express = require('express');

// SERVER
const server = express();

// DOCUMENT ROOT
server.use(express.static('public', {
    extensions: ['html']
}));

// FUNCTIONS

const init = () => {
    server.listen(80, err => console.log(err || 'Server running'));
}

init();