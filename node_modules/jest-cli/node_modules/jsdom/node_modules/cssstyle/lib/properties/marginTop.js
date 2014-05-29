'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('margin-top', v);
    },
    get: function () {
        return this.getPropertyValue('margin-top');
    },
    enumerable: true,
    configurable: true
};
