'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('speak-numeral', v);
    },
    get: function () {
        return this.getPropertyValue('speak-numeral');
    },
    enumerable: true,
    configurable: true
};
