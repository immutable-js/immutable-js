'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('margin', v);
    },
    get: function () {
        return this.getPropertyValue('margin');
    },
    enumerable: true,
    configurable: true
};
