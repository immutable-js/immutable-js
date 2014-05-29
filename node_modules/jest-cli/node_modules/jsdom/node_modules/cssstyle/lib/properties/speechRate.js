'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('speech-rate', v);
    },
    get: function () {
        return this.getPropertyValue('speech-rate');
    },
    enumerable: true,
    configurable: true
};
