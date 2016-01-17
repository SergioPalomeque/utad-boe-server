'use strict';
var validator = require('is-my-json-valid');

function Validator (data, schema) {
    this.data = data;
    this.validate = validator(schema);
}

Validator.prototype.isValid = function () {
    return this.validate(this.data);
};

Validator.prototype.getErrors = function () {
    return this.validate.errors;
};

module.exports = Validator;