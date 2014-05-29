'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-underline', v);
    },
    get: function () {
        return this.getPropertyValue('text-underline');
    },
    enumerable: true,
    configurable: true
};
