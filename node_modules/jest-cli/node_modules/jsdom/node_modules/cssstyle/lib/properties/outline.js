'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('outline', v);
    },
    get: function () {
        return this.getPropertyValue('outline');
    },
    enumerable: true,
    configurable: true
};
