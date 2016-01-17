'use strict';
var path = require('path');

function indexController (req, res) {
  res.sendFile(path.resolve(__dirname + '../../../../views/index.html'));
}

module.exports = indexController;