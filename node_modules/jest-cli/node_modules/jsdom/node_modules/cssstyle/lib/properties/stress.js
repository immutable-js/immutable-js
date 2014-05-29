'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('stress', v);
    },
    get: function () {
        return this.getPropertyValue('stress');
    },
    enumerable: true,
    configurable: true
};
