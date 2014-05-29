'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('play-during', v);
    },
    get: function () {
        return this.getPropertyValue('play-during');
    },
    enumerable: true,
    configurable: true
};
