'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('background-repeat-y', v);
    },
    get: function () {
        return this.getPropertyValue('background-repeat-y');
    },
    enumerable: true,
    configurable: true
};
