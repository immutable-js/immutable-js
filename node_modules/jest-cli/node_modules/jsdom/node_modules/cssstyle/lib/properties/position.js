'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('position', v);
    },
    get: function () {
        return this.getPropertyValue('position');
    },
    enumerable: true,
    configurable: true
};
