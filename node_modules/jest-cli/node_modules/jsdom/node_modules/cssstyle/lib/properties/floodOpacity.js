'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('flood-opacity', v);
    },
    get: function () {
        return this.getPropertyValue('flood-opacity');
    },
    enumerable: true,
    configurable: true
};
