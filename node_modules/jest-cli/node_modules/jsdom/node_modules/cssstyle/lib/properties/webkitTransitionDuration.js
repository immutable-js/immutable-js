'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-transition-duration', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-transition-duration');
    },
    enumerable: true,
    configurable: true
};
