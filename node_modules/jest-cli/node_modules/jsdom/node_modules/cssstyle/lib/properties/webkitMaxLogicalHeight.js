'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-max-logical-height', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-max-logical-height');
    },
    enumerable: true,
    configurable: true
};
