'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('fill', v);
    },
    get: function () {
        return this.getPropertyValue('fill');
    },
    enumerable: true,
    configurable: true
};
