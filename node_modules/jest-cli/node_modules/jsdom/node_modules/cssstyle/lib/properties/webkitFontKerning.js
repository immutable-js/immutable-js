'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-font-kerning', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-font-kerning');
    },
    enumerable: true,
    configurable: true
};
