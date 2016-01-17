'use strict';
var ObjectID = require('mongodb').ObjectID;
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var mongoPool = require('../../connectors/mongo_pool');
var mongoUri = mongoPool.getUri(config.databases.mongodb);
var dbConstant = require('../../commons/dbConstant');

function buildQuery (boes) {
  var result = [];
  boes.forEach(function (boe) {
    result.push({_id: ObjectID(boe)})
  });
  return result;
}

function getBoesByIdsService (boes, fields, callback) {
  var select = {$or: buildQuery(boes)};
  mongoPool.get(mongoUri).find(dbConstant.collections.boeApp_boe, select, fields, function (err, boes) {
    callback(err, boes)
  });
}

module.exports = getBoesByIdsService;