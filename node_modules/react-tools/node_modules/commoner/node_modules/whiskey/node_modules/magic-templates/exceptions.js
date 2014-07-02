/**
 * Exception that's thrown when invalid markup is encoutered.
 */
exports.TSE = exports.TemplateSyntaxError = function( message ){
  this.name = "TemplateSyntaxError";
  this.message = message;
  this.toString = function(){ return this.name + ": " + this.message; }
}
exports.TSE.prototype = new Error();

/** 
* 
 * Exception that's thrown when other errors happen, like a missing file.
 */
exports.TE = exports.TemplateError = function( message ){
  this.name = "TemplateError";
  this.message = message;
  this.toString = function(){ return this.name + ": " + this.message; }
}
exports.TE.prototype = new Error();