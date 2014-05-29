'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('richness', v);
    },
    get: function () {
        return this.getPropertyValue('richness');
    },
    enumerable: true,
    configurable: true
};
