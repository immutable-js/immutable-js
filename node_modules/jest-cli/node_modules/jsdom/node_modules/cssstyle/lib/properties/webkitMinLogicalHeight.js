'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-min-logical-height', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-min-logical-height');
    },
    enumerable: true,
    configurable: true
};
