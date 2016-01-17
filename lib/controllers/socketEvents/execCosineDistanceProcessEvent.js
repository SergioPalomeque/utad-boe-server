'use strict';
var path = require('path');
var logger = require('../../logger/logger').logger(__filename);
var process = require('child_process');
var config = require('../../../config/config').databases.mongodb;
var dbConstant = require('../../commons/dbConstant');

function execCosineDistanceProcessEvent (socket) {
  var root = path.join(__dirname, '..', '..', '..', 'boes-process', 'spark-1.4.0-bin-hadoop2.6', 'bin');
  var jarPath = path.join(__dirname, '..', '..', '..', 'boes-process', 'utad-1.0-jar-with-dependencies.jar');
  var jarParams = config.host +' '+ config.port +' ' + config.database +' '+ dbConstant.collections.boeApp_boe;

  var exec = process.exec('sh spark-submit --class boe.BoeApp ' + jarPath + ' ' + jarParams , {cwd: root});

  exec.stderr.on('data', function (data) {
    socket.emit('distanceProcess', data.toString());
  });

  exec.on('error', function(err){
    logger.error(err);
  });

  exec.on('close', function (code) {
    logger.debug(JSON.stringify(code));
    socket.emit('distanceProcessEnd')
  });
}

module.exports = execCosineDistanceProcessEvent;
