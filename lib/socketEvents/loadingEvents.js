'use strict';
var saveBoesEvent = require('../controllers/socketEvents/saveBoesEvent');
var execCosineDistanceProcessEvent = require('../controllers/socketEvents/execCosineDistanceProcessEvent');
function register(socket) {
  socket.on('disconnect', function (){
    console.log('user disconnected: ' + socket.id)
  });
  socket.on('startSaveBoesEvent', function (msg) {
    global.continueSavingBoes = true;
    saveBoesEvent(socket, msg);
  });
  socket.on('stopSaveBoesEvent', function () {
    global.continueSavingBoes = false;
  });
  socket.on('execCosineDistanceProcess', function () {
    execCosineDistanceProcessEvent(socket);
  })
}
module.exports.register = register;
