// All these ways of requiring WidgetShare should get normalized to the
// same relative identifier: "../WidgetShare".
require("./share");
require("../widget/share");
require("WidgetShare");
require("../WidgetShare");

// These identifiers will both become "./gallery".
require("../widget/gallery");
require("./gallery");

// These both become "../assert".
require("assert");
require("../assert");

// These circular references should both become "./follow".
require("./follow");
require("../widget/follow");

exports.name = "widget/follow";
