'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('list-style-position', v);
    },
    get: function () {
        return this.getPropertyValue('list-style-position');
    },
    enumerable: true,
    configurable: true
};
