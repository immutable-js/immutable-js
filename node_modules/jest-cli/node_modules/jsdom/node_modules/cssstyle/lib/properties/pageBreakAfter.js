'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('page-break-after', v);
    },
    get: function () {
        return this.getPropertyValue('page-break-after');
    },
    enumerable: true,
    configurable: true
};
