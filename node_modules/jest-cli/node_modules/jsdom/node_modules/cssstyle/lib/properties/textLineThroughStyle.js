'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-line-through-style', v);
    },
    get: function () {
        return this.getPropertyValue('text-line-through-style');
    },
    enumerable: true,
    configurable: true
};
