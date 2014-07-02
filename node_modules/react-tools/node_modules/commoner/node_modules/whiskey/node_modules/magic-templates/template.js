// Template is separated form prototype to avoid circular imports
 
/** @class
 *  
 * A template always represents a physical file. 
 * You usually work with one (the first) instance of Template per 
 * request, and it is created by the controller. 
 *  
 * Templates are loaded (read from disk) and parsed asynchronously 
 * to obtain an array of 'children' which are the tempate tags and  
 * HTML strings (called tokens in common) in the template file.  
 * When the debug setting is set to false, these tokens are cached. 
 *  
 * While the template reads the file from the disk, it's 'blocked' property 
 * is set to a number greater than 0. It will not be rendered until its 
 * blocked counter reaches 0 again. The blocked counter decrements when 
 * the reading and parsing is finished.
 * 
 * The main template (for example 'pages/home.html') is the one that is 
 * called by the controller. Some tags inside the template may reference 
 * other files, for example the {% extends "base.html" %} tag. This will
 * create another instance of Template, load, parse and cache it. In
 * case we don't have "base.html" cahced, the template will increase the
 * blocked counter of *the main template* - in our case 'pages/home.html'.
 * Again, nothing will render until the main template's blocked counter 
 * reaches zero again. 
 *  
 * On a warm cache, the reading and parsing almost never happens so the speed is 
 * considerably higher. 
 *  
 * @param {String} the filepath to the template file 
 * @param {Object} a refernce to the main template. If left out _this_ is used.
 */
exports.Template = function( filepath, main ){
  // Filepath relative to the templates directory
  this.filepath = filepath;
  // Contains the parsed tokens found in this template
  this.children = [];
  // Counts how many templates on which this one depends are still parsed
  this.blocked  = 0;
  // A reference to the template that we initially called to render.
  this.main = main || this;
}