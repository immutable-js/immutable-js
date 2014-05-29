'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('stop-opacity', v);
    },
    get: function () {
        return this.getPropertyValue('stop-opacity');
    },
    enumerable: true,
    configurable: true
};
