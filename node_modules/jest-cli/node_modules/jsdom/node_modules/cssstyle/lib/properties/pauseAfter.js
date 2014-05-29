'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('pause-after', v);
    },
    get: function () {
        return this.getPropertyValue('pause-after');
    },
    enumerable: true,
    configurable: true
};
