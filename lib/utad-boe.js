'use strict';
var util = require('util');
var path = require('path');
var config = require('./../config/config');
var cluster = require('cluster');
var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var methodOverride = require('method-override');
var routes = require('./routes/loadingRoutes');
var router = express.Router();
var socketEvents = require('./socketEvents/loadingEvents');
var app = express();
var http = require('http');
var async = require('async');
var socketio = require('socket.io');
var logger = require('./logger/logger').logger(__filename);

var mongoLoader = require('./loaders/mongo');
var io;

var theHTTPLog = morgan(config.app.traces, {
  'stream': {
    write: function (str) {
      // Removed to use the customized logger for HTTP traffic logging
      //theAppLog.debug(str);
      logger.debug(str);
    }
  }
});

var started = false;

function start() {
  logger.info('Starting Logging server, please wait...');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'jade');
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(theHTTPLog);
  app.use(methodOverride());
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(function (req, res, next) {
    req.boeApp = {
      io: io
    };
    next();
  });
  app.use('/', router);
  routes.register(app);

  http = http.createServer(app).listen(config.app.http);
  io = socketio.listen(http);
  app.listen(config.app.port, config.app.host, function () {
    async.series([mongoLoader.loader],
        function (err) {
          if (err) {
            logger.error(util.format('Something went wrong during boot time (%s)', err));
            process.exit(1);
          } else {
            logger.info('Server started at ports [ HTTP:' + config.app.http + ', HTTPS:' + config.app.https + ' ]');
            started = true;
          }
        });
  });
  process.on('uncaughtException', function (err) {
    logger.error('Uncaught Exception' + err.stack, err);
  });

  io.on('connection', function(socket){
    socketEvents.register(socket);
  });

}

function startInCluster() {
  if (!cluster.isMaster) {
    start();
  }
  else {
    var threads = require('os').cpus().length;
    while (threads--) cluster.fork();
    cluster.on('death', function (worker) {
      cluster.fork();
      logger.info('Process died and restarted, pid:', worker.pid);
    });
  }
}
function active() {
  return started;
}
function stop() {
  process.exit(0);
}

exports.start = start;
exports.startInCluster = startInCluster;
exports.active = active;
exports.stop = stop;
