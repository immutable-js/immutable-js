'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('cue-before', v);
    },
    get: function () {
        return this.getPropertyValue('cue-before');
    },
    enumerable: true,
    configurable: true
};
