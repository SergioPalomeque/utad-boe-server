'use strict';
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var getBoesByPageService = require('../../services/boes/getBoesByPageService');

function getData (query) {
  return {
    pageNumber: parseInt(query.pageNumber),
    pageSize: parseInt(query.pageSize)
  }
}

function getBoesController (req, res) {
  var data = getData(req.query);
  var fields = {boeId: 1, date: 1};
  getBoesByPageService(data, fields, function (err, boes) {
    if (err) {
      logger.error(err);
      res.sendStatus(500);
    } else {
      logger.debug(JSON.stringify(boes));
      var response = {
        data: boes.data,
        pageNumber: data.pageNumber,
        maxPages: Math.ceil(boes.count/data.pageSize)
      };
      res.status(200).send(response)
    }
  });
}

module.exports = getBoesController;