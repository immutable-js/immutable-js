'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-column-break-before', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-column-break-before');
    },
    enumerable: true,
    configurable: true
};
