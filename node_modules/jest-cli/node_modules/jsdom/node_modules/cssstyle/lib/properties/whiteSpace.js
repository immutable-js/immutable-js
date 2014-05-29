'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('white-space', v);
    },
    get: function () {
        return this.getPropertyValue('white-space');
    },
    enumerable: true,
    configurable: true
};
