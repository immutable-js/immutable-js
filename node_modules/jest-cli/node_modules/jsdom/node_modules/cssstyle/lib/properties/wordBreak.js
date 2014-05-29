'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('word-break', v);
    },
    get: function () {
        return this.getPropertyValue('word-break');
    },
    enumerable: true,
    configurable: true
};
