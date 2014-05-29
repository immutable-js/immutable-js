'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('voic-family', v);
    },
    get: function () {
        return this.getPropertyValue('voice-family');
    },
    enumerable: true,
    configurable: true
};
