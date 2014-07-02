// Taken from underscore.js, version 1.4.2, line 1073.
_.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g // this line parsed oddly
};
