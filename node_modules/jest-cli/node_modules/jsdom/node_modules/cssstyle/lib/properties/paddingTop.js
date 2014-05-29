'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('padding-top', v);
    },
    get: function () {
        return this.getPropertyValue('padding-top');
    },
    enumerable: true,
    configurable: true
};
