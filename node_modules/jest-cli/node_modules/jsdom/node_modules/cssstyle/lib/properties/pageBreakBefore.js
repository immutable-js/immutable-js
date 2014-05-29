'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('page-break-before', v);
    },
    get: function () {
        return this.getPropertyValue('page-break-before');
    },
    enumerable: true,
    configurable: true
};
