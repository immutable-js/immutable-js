'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('box-shadow', v);
    },
    get: function () {
        return this.getPropertyValue('box-shadow');
    },
    enumerable: true,
    configurable: true
};
