'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('text-indent', v);
    },
    get: function () {
        return this.getPropertyValue('text-indent');
    },
    enumerable: true,
    configurable: true
};
