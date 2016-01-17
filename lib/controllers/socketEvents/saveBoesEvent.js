'use strict';
var async = require('async');
var logger = require('../../logger/logger').logger(__filename);
var request = require('request');
var moment = require('moment');
var _ = require('lodash');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
var config = require('../../../config/config');
var uri = require('../../connectors/mongo_pool').getUri(config.databases.mongodb);
var mongoPool = require('../../connectors/mongo_pool');
var dbConstants = require('../../commons/dbConstant');
var iconv = require('iconv-lite');
var boeDomain = 'http://boe.es';
var urlBoeMain = boeDomain + '/diario_boe/xml.php?id=BOE-S-';

function getSections (mainBoeDoc) {
  var xml = mainBoeDoc;
  var doc = new dom().parseFromString(xml);
  var nodes = xpath.select("//urlXml/text()", doc);
  return nodes;
}

function getDocumentInfo (document) {
  var doc = new dom().parseFromString(document);
  var boeId = xpath.select("//identificador/text()", doc);
  var date = xpath.select("//fecha_publicacion/text()", doc);
  return {
    boeId: boeId.toString(),
    date: moment.utc(date.toString()).toJSON()
  }
}
function getDates (dates) {
  var result = [];
  var from = moment(dates.from);
  var until = moment(dates.until);

  for (var m = from; m.isBefore(until); m.add('days', 1)) {
    result.push(m.format('YYYYMMDD'))
  }
  logger.debug(JSON.stringify(result));
  return result;
}

function saveBoesEvent (socket, dates) {
  var dates = getDates(dates);
  var len = dates.length;
  var i = 0;
  async.doWhilst(function (callback) {
    var date = dates[i];
    request.get(urlBoeMain + date, function (err, doc) {
      if (err) {
        logger.error(err);
        callback(err)
      } else {
        var urlXmls = getSections(doc.body);
        var j = 0;
        var len = urlXmls.length;
        async.doWhilst(function (cb) {
          var urlXml = urlXmls[j];
          var params = {
            uri: boeDomain + urlXml,
            encoding: null
          };
          request.get(params, function (err, result) {
            if (err) {
              logger.error(err);
              cb(err)
            } else {
              var boeDocument = iconv.decode(new Buffer(result.body), 'ISO-8859-1');
              var boeDocumentInfo = getDocumentInfo(boeDocument);
              logger.debug(JSON.stringify(boeDocumentInfo));
              var insert = {
                boeId: boeDocumentInfo.boeId,
                document: boeDocument,
                date: boeDocumentInfo.date
              };
              mongoPool.get(uri).insert(dbConstants.collections.boeApp_boe, insert, function (err, result) {
                if (err) {
                  logger.error(err);
                  cb(err);
                } else {
                  logger.debug(JSON.stringify(result));
                  socket.emit('boeInserted', result[0].boeId);
                  cb(null);
                }
              })
            }
          })
        }, function () {
          j++;
          return j < len && global.continueSavingBoes
        }, function (err) {
          if (err) {
            logger.debug(err);
            callback(err);
          } else {
            socket.emit('mainBoe', date);
            callback(null);
          }
        });
      }
    });
  }, function () {
    i++;
    return i < len && global.continueSavingBoes
  }, function (err, logEvent) {

  });
}

module.exports = saveBoesEvent;