'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-max-logical-width', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-max-logical-width');
    },
    enumerable: true,
    configurable: true
};
