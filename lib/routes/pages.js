'use strict';
var config = require('../../config/config');
var indexController = require('../../lib/controllers/pages/indexController');
var loadController = require('../../lib/controllers/pages/loadController');

exports.registerRoutes = function (app) {
  app.get('/', indexController);
  app.get('/boes', indexController);
  app.get('/load', loadController);
};