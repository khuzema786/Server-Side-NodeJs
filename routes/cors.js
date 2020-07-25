const express = require('express');
const cors = require('cors');
const app = express();

// All origins that the server is willing to accept
const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));

    // Checking if the incoming requests origin is in the whitelist, if yes then the index will be 0 or greater 
    // The indexOf() method searches the array for the specified item, and returns its position.
    // The search will start at the specified position, or at the beginning if no start position is specified, and end the search at the end of the array.
    // Returns -1 if the item is not found.

    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);  // Cb is callback with first parameter as error and second as result
};

exports.cors = cors();  // Works for * i.e, any server
exports.corsWithOptions = cors(corsOptionsDelegate); // Works on whitelisted options