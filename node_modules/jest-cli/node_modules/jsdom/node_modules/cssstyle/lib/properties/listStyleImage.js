'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('list-style-image', v);
    },
    get: function () {
        return this.getPropertyValue('list-style-image');
    },
    enumerable: true,
    configurable: true
};
