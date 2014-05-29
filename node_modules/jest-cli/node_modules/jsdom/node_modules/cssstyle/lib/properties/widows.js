'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('widows', v);
    },
    get: function () {
        return this.getPropertyValue('widows');
    },
    enumerable: true,
    configurable: true
};
