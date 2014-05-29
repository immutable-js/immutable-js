'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('outline-width', v);
    },
    get: function () {
        return this.getPropertyValue('outline-width');
    },
    enumerable: true,
    configurable: true
};
