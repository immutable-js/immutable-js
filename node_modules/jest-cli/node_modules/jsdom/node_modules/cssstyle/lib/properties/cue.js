'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('cue', v);
    },
    get: function () {
        return this.getPropertyValue('cue');
    },
    enumerable: true,
    configurable: true
};
