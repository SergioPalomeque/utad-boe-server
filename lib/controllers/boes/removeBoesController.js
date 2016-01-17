'use strict';
var logger = require('../../logger/logger').logger(__filename);
var dbConstant = require('../../commons/dbConstant');
var removeCollectionService = require('../../services/commons/removeCollectionService');


function removeBoesController (req, res) {
  removeCollectionService(dbConstant.collections.boeApp_boe, function (err) {
    if (err) {
      logger.error(err);
      res.sendStatus(500);
    } else {
      removeCollectionService(dbConstant.collections.boeApp_distances, function (err) {
        if (err) {
          logger.error(err);
          res.sendStatus(500);
        } else {
          res.sendStatus(204)
        }
      })
    }
  });
}

module.exports = removeBoesController;