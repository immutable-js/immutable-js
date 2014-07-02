var util = require('util')
  , isArray = Array.isArray
  , DEFAULT_STACK = (global.SETTINGS && SETTINGS.CONTEXT_DEFAULT_STACK) || [];

/** @class 
 * 
 * A Context contains all variables passed to the template 
 * by the view. You normally don't create contexts, but rather
 * pass a simple hash (object) to the template's render method. 
 * The template then creates the context. 
 * 
 * We are not using simple hashes for this task 
 * because we need to push and pop additional contexts onto 
 * the original one. This is done by keeping the original hash
 * in a stack on which we push/pop more context hashes.
 *  
 * @param {Hash} original context
 */
function Context( hash ){
  (this.stack = [].concat(DEFAULT_STACK) ).push( hash );
  this.size  = this.stack.length;
}

/**
 * Pushes a hash to the default context stack. 
 * Every context instance will the hashes pushed to the default. 
 *  
 * @param {Object} The hash to be pushed 
 */
Context.addToDefault = function( hash ){
  if( typeof hash === 'object' )
    DEFAULT_STACK.push( hash );
}

/**
 * Clears the default context stack
 */
Context.clearDefault = function(){
    DEFAULT_STACK = [];
}

Context.prototype = {
  /**
   * Retrieves a variable from the context. If the value is not 
   * found in the topmost member of the stack it goes deeper.  
   * If not found, returns null.
   *  
   * @param {String} name of the variable 
   * @returns {Mixed} the variable
   */
  get: function( key ){
    var i     = this.size
      , stack = this.stack;
    
    if( key.indexOf(".") > -1 )
      return this.getPath( key );

    while( i-- )
      if( key in stack[i] )
        return stack[i][key];
        
    return null;
  }
  
  /**
   * Retrieves a variable path from the context. The path is 
   * dot-separated (variable.foo.bar).  
   * In this case the context looks for a key names 'variable'. 
   * After finding it, it looks for its 'foo' property and then 
   * for the 'bar' property of the found property. 
   *   
   * If the variable is not found in the context, returns null. 
   * If the variable is found, but does not have the property,  
   * returns undefined, like usual.
   * 
   * @param {String} the variable path 
   * @returns {Mixed} whatever comes out
   */
  , getPath: function( path ){
    path = isArray( path ) ? path : path.split(".");
    var i = this.size
      , key = path.shift()
      , stack = this.stack;
    while( i-- )
      if( key in stack[i] )
        return Object.getPath( stack[i][key], path );
    return null;
  }

  /**
   * Pushes a new context hash on the current context. 
   *  
   * @param {Hash} the new context 
   */
  , push: function( hash ){
    ++this.size;
    this.stack.push( hash );
  }

  /**
   * Pops the last added context hash from the stack  
   *  
   * @returns {Hash} what we just popped
   */
  , pop: function( ){
    --this.size;
    return this.stack.pop();
  }

  /**
   * Returns a copy of the context at the moment.
   * Use this when you need to save the current context
   * and you expect it to change later. 
   * 
   * @returns {Object} the context copy
   */
  , clone: function(){
    var c = new Context({}), i=0;
    while( i < this.size )
      c.push( Object.merge( {}, this.stack[ i++ ] ) );
    return c;
  }
}

exports.Context = Context;
