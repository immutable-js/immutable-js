'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('visibility', v);
    },
    get: function () {
        return this.getPropertyValue('visibility');
    },
    enumerable: true,
    configurable: true
};
