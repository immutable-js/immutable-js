'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('speak', v);
    },
    get: function () {
        return this.getPropertyValue('speak');
    },
    enumerable: true,
    configurable: true
};
