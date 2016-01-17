'use strict';
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var mongoPool = require('../../connectors/mongo_pool');
var mongoUri = mongoPool.getUri(config.databases.mongodb);


function removeCollectionService (collectionName, callback) {
  mongoPool.get(mongoUri).drop(collectionName, function (err) {
    callback(err)
  });
}

module.exports = removeCollectionService;