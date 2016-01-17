'use strict';
var async = require('async');
var Mongo = require('mongodb');
var retry = 1;
var mongoPool = require('./mongo_pool');
var policy;


function MongoConnector(logger, retrying, dbConfig) {
  this.log = logger;
  policy = retry = retrying;
  this.config = dbConfig;
  this.client = null;
}

MongoConnector.prototype = {
  init: function (callback) {
    var that = this;
    if (retry-- < 0) return callback(new Error().statusCode = -1, null);
    var url = 'mongodb://' + ((this.config.user) ? this.config.user + ':' + this.config.password : '') + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
    Mongo.connect(url, function (err, db) {
      if (err) {
        that.log.error(err);
        return that.init(callback);
      } else {
        that.client = db;
        retry = that.config.retry;
        mongoPool.set(url, that);
        callback(null, db);
      }
      db.on('close', function () {
        that.log.error('Close event received at:' + JSON.stringify(config));
        mongoPool.remove(url);
        retry = policy;
        return that.init(callback);
      });
    });
  },
  findOne: function (collectionName, data, options, callback) {
    'use strict';
    if (callback === undefined) {
      callback = options;
      options = {};
    }
    var collection = this.client.collection(collectionName);
    collection.findOne(data, options, function (err, result) {
      callback(err, result);
    });
  },
  paginate: function (collectionName, select, fields, pageNumber, pageSize, orderField, orderAsc, callback) {
    'use strict';
    var that = this;
    var from = pageNumber * pageSize;
    var until = from + pageSize;
    fields['normalized'] = {$toLower: '$' + orderField};
    var pipeline = [
      {$match: select},
      {$project: fields},
      //{$sort: {normalized: orderAsc}},
      {$limit: until},
      {$skip: from}
    ];
    var collection = this.client.collection(collectionName);
    async.parallel([
      function (callback) {
        collection.aggregate(pipeline, function (err, result) {
          if (err) {
            callback(err)
          } else {
            callback(null, result);
          }
        });
      },
      function (callback) {
        that.count(collectionName, select, function (err, count) {
          if (err) {
            callback(err)
          } else {
            callback(null, count);
          }
        })
      }
    ], function (err, results) {
      if (err) {
        callback(err)
      } else {
        var response = {data: results[0], count: results[1]};
        callback(err, response);
      }
    });
  },
  find: function (collectionName, data, options, skip, limit, sort, callback) {
    'use strict';
    var args = Array.prototype.slice.call(arguments, 1);
    callback = args.pop();
    data = args.length ? args.shift() : {};
    options = args.length ? args.shift() : {};
    skip = args.length ? args.shift() : 0;
    limit = args.length ? args.shift() : 0;
    sort: args.length ? args.shift() : {};
    var collection = this.client.collection(collectionName);
    collection.find(data, options).skip(skip).limit(limit).sort(sort).toArray(function (err, result) {
      if (err) callback(err);
      else callback(null, [].slice.call(result));
    });
  },
  insert: function (collectionName, data, callback) {
    'use strict';
    var collection = this.client.collection(collectionName);
    collection.insert(data, function (err, result) {
      callback(err, result.ops);
    });
  },
  count: function (collectionName, data, callback) {
    'use strict';
    var collection = this.client.collection(collectionName);
    collection.find(data).count(function (err, result) {
      callback(err, result);
    });
  },
  new: function (collectionName, callback) {
    'use strict';
    var options = {
      'limit': -1,
      'sort': {id: -1}
    };
    this.client.collection(collectionName, function (err, coll) {
      coll.find({}, options).toArray(function (err, count) {
        callback(err, count[0].id);
      });
    });
  },
  update: function (collectionName, query, data, options, callback) {
    'use strict';
    if (callback === undefined) {
      callback = options;
      options = {};
    }
    var collection = this.client.collection(collectionName);
    collection.update(query, data, options, function (err, result) {
      callback(err, result.result.n);
    });
  },
  remove: function (collectionName, query, callback) {
    'use strict';
    var collection = this.client.collection(collectionName);
    collection.remove(query, function (err, result) {
      callback(err, result.result.n);
    });
  },
  findAndModify: function (collectionName, query, sort, doc, options, callback) {
    'use strict';
    var collection = this.client.collection(collectionName);
    collection.findAndModify(query, sort, doc, options, function (err, result) {
      callback(err, result.value);
    });
  },
  aggregate: function (collectionName, pipeline, options, callback) {
    'use strict';
    if (callback === undefined) {
      callback = options;
      options = {};
    }
    var collection = this.client.collection(collectionName);
    collection.aggregate(pipeline, options, function (err, result) {
      callback(err, result);
    });
  },
  drop: function (collectionName, callback) {
    'use strict';
    var collection = this.client.collection(collectionName);
    collection.drop(function (err, result) {
      callback(err, result);
    })
  },
  initializeOrderedBulkOp: function (collectionName) {
    var collection = this.client.collection(collectionName);
    return collection.initializeOrderedBulkOp();
  },
  initializeUnorderedBulkOp: function (collectionName) {
    var collection = this.client.collection(collectionName);
    return collection.initializeUnorderedBulkOp();
  }
};
module.exports = MongoConnector;