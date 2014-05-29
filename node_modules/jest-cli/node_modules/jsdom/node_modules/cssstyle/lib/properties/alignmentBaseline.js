'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('alignment-baseline', v);
    },
    get: function () {
        return this.getPropertyValue('alignment-baseline');
    },
    enumerable: true,
    configurable: true
};
