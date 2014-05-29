'use strict';

var parseColor = require('../parsers').parseColor;

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-match-nearest-mail-blockquote-color', parseColor(v));
    },
    get: function () {
        return this.getPropertyValue('-webkit-match-nearest-mail-blockquote-color');
    },
    enumerable: true,
    configurable: true
};
