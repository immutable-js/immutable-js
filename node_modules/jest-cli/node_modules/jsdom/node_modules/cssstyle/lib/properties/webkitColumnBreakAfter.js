'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-column-break-after', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-column-break-after');
    },
    enumerable: true,
    configurable: true
};
