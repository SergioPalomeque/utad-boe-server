'use strict';
var config = require('../../config/config');
var getBoesController = require('../controllers/boes/getBoesController');
var getDistancesBetweenBoesController = require('../controllers/boes/getDistancesBetweenBoesController');
var removeBoesController = require('../controllers/boes/removeBoesController');

exports.registerRoutes = function (app) {
  app.delete(config.app.api + '/boes', removeBoesController);
  app.get(config.app.api + '/boes', getBoesController);
  app.get(config.app.api + '/boes/distances', getDistancesBetweenBoesController);
};