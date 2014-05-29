'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('fill-rule', v);
    },
    get: function () {
        return this.getPropertyValue('fill-rule');
    },
    enumerable: true,
    configurable: true
};
