'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-decoration', v);
    },
    get: function () {
        return this.getPropertyValue('text-decoration');
    },
    enumerable: true,
    configurable: true
};
