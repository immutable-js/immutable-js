'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('shape-rendering', v);
    },
    get: function () {
        return this.getPropertyValue('shape-rendering');
    },
    enumerable: true,
    configurable: true
};
