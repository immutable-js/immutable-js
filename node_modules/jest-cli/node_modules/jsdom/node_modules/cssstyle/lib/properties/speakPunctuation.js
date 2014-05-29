'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('speak-punctuation', v);
    },
    get: function () {
        return this.getPropertyValue('speak-punctuation');
    },
    enumerable: true,
    configurable: true
};
