'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-box-pack', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-box-pack');
    },
    enumerable: true,
    configurable: true
};
