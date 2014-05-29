'use strict';

var shorthandParser = require('../parsers').shorthandParser;

var shorthand_for = {
    borderTopWidth: require('./borderTopWidth'),
    borderTopStyle: require('./borderTopStyle'),
    borderTopColor: require('./borderTopColor')
};

var isValid = module.exports.isValid = function isValid(v) {
    return shorthandParser(v, shorthand_for) !== undefined;
};

module.exports.definition = {
    set: function (v) {
        var obj = shorthandParser(v, shorthand_for);
        if (obj === undefined) {
            return;
        }
        Object.keys(obj).forEach(function (property) {
            this._values[property] = obj[property];
        }, this);
        this.setProperty('border-top', v);
    },
    get: function () {
        return this.getPropertyValue('border-top');
    },
    enumerable: true,
    configurable: true
};
