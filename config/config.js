'use strict';
var development = require('./development');
var preproduction = require('./preproduction');
var production = require('./production');

module.exports = function () {
    var env = process.env.NODE_ENV || 'development';
    switch (env) {
        case 'development':
            return development;
        case 'preproduction':
            return preproduction;
        case 'production':
            return production;
    }
}();
