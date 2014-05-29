'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('resize', v);
    },
    get: function () {
        return this.getPropertyValue('resize');
    },
    enumerable: true,
    configurable: true
};
