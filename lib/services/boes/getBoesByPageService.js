'use strict';
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var mongoPool = require('../../connectors/mongo_pool');
var mongoUri = mongoPool.getUri(config.databases.mongodb);
var dbConstant = require('../../commons/dbConstant');

function getBoesByPageService (data, fields, callback) {
  logger.debug(JSON.stringify(data));
  var select = {};
  mongoPool.get(mongoUri).paginate(dbConstant.collections.boeApp_boe, select, fields, data.pageNumber, data.pageSize, 'date', 1, function (err, boes) {
    if (err) {
      callback(err)
    } else {
      logger.debug(JSON.stringify(boes));
      callback(null, boes)
    }
  });
}

module.exports = getBoesByPageService;