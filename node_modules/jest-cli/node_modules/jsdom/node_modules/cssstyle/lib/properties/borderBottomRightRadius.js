'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('border-bottom-right-radius', v);
    },
    get: function () {
        return this.getPropertyValue('border-bottom-right-radius');
    },
    enumerable: true,
    configurable: true
};
