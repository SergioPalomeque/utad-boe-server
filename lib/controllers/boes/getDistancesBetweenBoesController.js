'use strict';
var async = require('async');
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var getBoesByIdsService = require('../../services/boes/getBoesByIdsService');
var getDistanceMatrixService = require('../../services/boes/getDistanceMatrixService');

function getData (query) {
  return {
    boes: query.boes
  }
}

function getDistancesBetweenBoesController (res, req) {
  var data = getData(res.query);

  async.parallel([
    function (callback) {
      var fields = {boeId: 1, date: 1};
      getBoesByIdsService(data.boes, fields, function (err, boes) {
        callback(err, boes)
      })
    },
    function (callback) {
      getDistanceMatrixService(data.boes, function (err, distanceMatrix) {
        callback(err, distanceMatrix);
      })
    }
  ], function (err, results) {
    if (err) {
      logger.error(err);
      req.sendStatus(500);
    } else {
      var response = {
        boes: results[0],
        matrixDistance: results[1]
      };
      req.status(200).send(response);
    }
  });
}

module.exports = getDistancesBetweenBoesController;