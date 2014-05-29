'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-column-gap', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-column-gap');
    },
    enumerable: true,
    configurable: true
};
