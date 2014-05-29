'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-region-overflow', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-region-overflow');
    },
    enumerable: true,
    configurable: true
};
