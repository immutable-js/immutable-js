'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('pause-before', v);
    },
    get: function () {
        return this.getPropertyValue('pause-before');
    },
    enumerable: true,
    configurable: true
};
