'use strict';

module.exports.definition = {
    set: function (v) {
        this.setProperty('-webkit-margin-collapse', v);
    },
    get: function () {
        return this.getPropertyValue('-webkit-margin-collapse');
    },
    enumerable: true,
    configurable: true
};
