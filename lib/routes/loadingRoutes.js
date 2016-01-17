'use strict';
var boes = require('./boes');
var pages = require('./pages');
function register(app) {
  boes.registerRoutes(app);
  pages.registerRoutes(app);
}
module.exports.register = register;