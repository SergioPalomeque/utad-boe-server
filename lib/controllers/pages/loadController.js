'use strict';
var path = require('path');

function loadController (req, res) {
  res.sendFile(path.resolve(__dirname + '../../../../views/load.html'));
}

module.exports = loadController;