'use strict';
var logger = require('../logger/logger').logger(__filename);
var mongoConnector = require('../connectors/mongo_connector');
var config = require('../../config/config');
function mongodbLoader(callback) {
    var mC = new mongoConnector(logger,
        config.database_policy.retry,
        config.databases.mongodb);
    mC.init(function (err) {
        if (err)
            callback(err);
        else {
            logger.info('Connected to Mongo Database: ' + JSON.stringify(config.databases.mongodb.database));
            callback();
        }

    });
}
module.exports.loader = mongodbLoader;