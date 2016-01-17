'use strict';
var ObjectID = require('mongodb').ObjectID;
var logger = require('../../logger/logger').logger(__filename);
var config = require('../../../config/config');
var mongoPool = require('../../connectors/mongo_pool');
var mongoUri = mongoPool.getUri(config.databases.mongodb);
var dbConstant = require('../../commons/dbConstant');

function initDistanceMatrix (len) {
  var result = [];
  var i;
  for (i = 0; i < len; i++) {
    var row = [];
    row[i] = 0;
    result.push(row);
  }
  return result;
}

/*
 * ['a','b','c'] -> [{"$or":[{"$and":[{"from":{"$eq":"a"}},{"until":{"$eq":"b"}}]},{"$and":[{"from":{"$eq":"b"}},{"until":{"$eq":"a"}}]}]},{"$or":[{"$and":[{"from":{"$eq":"a"}},{"until":{"$eq":"c"}}]},{"$and":[{"from":{"$eq":"c"}},{"until":{"$eq":"a"}}]}]},{"$or":[{"$and":[{"from":{"$eq":"b"}},{"until":{"$eq":"c"}}]},{"$and":[{"from":{"$eq":"c"}},{"until":{"$eq":"b"}}]}]}]
 */
function buildMatrixQuery (boes) {
  var result = [];
  var len = boes.length;
  var i;
  for (i = 0; i < len; i++) {
    var j;
    for (j = i + 1; j < len; j++) {
      result.push({
        $or: [
          {
            $and: [
              {from: {$eq: ObjectID(boes[i])}},
              {until: {$eq: ObjectID(boes[j])}}
            ]
          },
          {
            $and: [
              {from: {$eq: ObjectID(boes[j])}},
              {until: {$eq: ObjectID(boes[i])}}
            ]
          }
        ]
      })
    }
  }
  return result;
}

function getIndexBoes (boes) {
  var indices = {};
  boes.forEach(function (boe, index) {
    indices[boe] = index;
  });
  return indices;
}

function getMatrixDistance (boes, values) {
  var distanceMatrix = initDistanceMatrix(boes.length);
  var indices = getIndexBoes(boes);
  values.forEach(function (value) {
    var i = indices[value.from.toHexString()];
    var j = indices[value.until.toHexString()];
    distanceMatrix[i][j] = value.value;
    distanceMatrix[j][i] = value.value;
  });

  return distanceMatrix;
}

function getDistanceMatrixService (boes, callback) {
  var select = {$or: buildMatrixQuery(boes)};
  var fields = {};
  mongoPool.get(mongoUri).find(dbConstant.collections.boeApp_distances, select, fields, function (err, result) {
    callback(err, getMatrixDistance(boes, result));
  })
}

module.exports = getDistanceMatrixService;