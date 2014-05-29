'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-column-axis', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-column-axis');
    },
    enumerable: true,
    configurable: true
};
