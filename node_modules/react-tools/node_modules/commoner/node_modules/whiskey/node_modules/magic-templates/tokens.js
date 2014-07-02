var util      = require('util')

    // Template module dependencies
  , E        = require('./exceptions')
  , tags     = require('./tags')
  
    // Globals
  , VAR_TOKEN_MISSING_WARNING = global.SETTINGS && SETTINGS.DEBUG ? "<span style='color:red'>Missing variable '%s'</span>" : ""

  , STRING_TOKEN      = 1
  , BLOCK_TOKEN       = 2
  , BLOCK_TOKEN_END   = 3
  , VAR_TOKEN         = 4
  
    // Matches opening and closing tag delimiters
  , blockTokenRegex   = /^\{% *| *%\}$/g
  , commentTokenRegex = /^\{# *| *#\}$/g
  , varTokenRegex     = /^\{\{ *| *\}\}$/g
  
    // A valid block-tag name
  , validBlockNameRegex = /^\w+/
  
    // A valid variable-tag name
  , validVarNameRegex = /^[A-Za-z0-9_.]+/
  
    // Shorthands
  , isArray  = Array.isArray;

/** @class
 * A Block Token (not to be confused with the 'block' tag)  
 * is a token defined by the {% and %} delimiters.
 * Block tokens are template tags with a specific logic.
 * The BlockToken class is responsible for deremining the tag type,
 * overriding the default _render_  and _compile_ functions and  
 * calling the tag function on itself. 
 * The tag logic is defined in the ./tags module as a function,  
 * or can be defined by the user. 
 * Block tokens whose tag name begins with 'end' are considered 
 * closing tags. Example: {% if ... %} ... {% endif %}. This means 
 * that you can't make a tag with a name starting with 'end'
 *  
 * @param {String} The tag name 
 * @param {String} Parameters passed to the tag 
 * @param {Object} A reference to the token/template that contains this token 
 * @param {Object} A reference to the main template
 */
var BlockToken = function( tagname, params, parent, main ){
  var tag;
  // Closing tags begin with "end" like in {% for %}{% endfor %}.
  if( tagname.indexOf("end") === 0 ) {
    tagname = tagname.substr(3);
    
    if( !(tag = tags[ tagname ]) || !tag.expectsClosing )
      throw new E.TSE("Unknown closing tag '%s'".fmt( tagname ));
    
    if( parent.tagname !== tagname )
      throw new E.TSE(
        "Unexpected closing tag 'end%s'; Expecting 'end%s'".fmt( tagname, parent.tagname ));
    
    this.type = BLOCK_TOKEN_END;
  }
  else {
    // Check if tag exists
    if( !( tag = tags[ tagname ] ) )
      throw new E.TSE( "Tag '%s' is not defined".fmt( tagname ) );
  
    this.type     = BLOCK_TOKEN;
    this.tagname  = tagname;
  
    // Copy some tag flags
    tag.expectsClosing && ( this.children = [] );
    tag.renderFunction && ( this.render = tag.renderFunction );
    tag.compileFunction && ( this.compile = tag.compileFunction );
  
    // Apply the tag function to this token
    tag.call( this, params, parent, main );
  }
}

BlockToken.prototype = {
  /**
   * This is the default block token render method
   * It just loops through the token's children and appends 
   * whatever output their render method returns. 
   * Tags can everride this method for specific needs 
   * and can call this function by using:
   * {{{ 
   *  Object.getPrototypeOf(this).render.call(this,arguments)
   * }}} 
   *  
   * If the children parameter is passed (it's supposed to be an 
   * array of tokens) it will be used instead of this token's children.
   *  
   * @param {Object} the context to use when rendering 
   * @param {Array} children to render instead of this token's children 
   * @return {Array} the output.
   */
  render: function( context, children ) {
    var i, j, r, token
      , output = []
      , tokens = children || this.children || [];
    
    for( i=0, j=tokens.length; i<j; ++i ) {
      token = tokens[ i ];
      // It's a token
      if( token.render )
        output = output.concat( token.render( context ) );
      // It's a string
      else
        output = output.concat( token );
    }
    return output;
  }
  
  /**
   * Compile is called after all of the token's children have been parsed 
   * and created. It normally doesn't do anything, but can be overridden by 
   * the specific tag implementation. This method is executed during the parsing 
   * phase.
   */
  , compile: function(){}
}

/**
 * A Var Token is a token defined by the {{ and }} delimiters.
 * Var Tokens are template tags that output context variables. 
 * The var token is created by passing it a string which is the 
 * context key of the value you need to putput. The key can be 
 * supplied in dot-separated form. In this case we look for 
 * a context variable names as the first segment and then try to 
 * get the following segments as properties (if the variable) is 
 * an object.
 *  
 * @param {String} the context key
 */
var VarToken = function( string ) { 
  // TODO: Add executing functions
  this.type   = VAR_TOKEN;
  this.lookup = string; 
}

VarToken.prototype = {
  /**
   * Outputs the context variable whose key is 
   * in this var token. If no such key exists in
   * the context nothing is output and no errors 
   * are raised. In debug mode a warning is rendered. 
   *   
   * @param {Object} the context 
   * @return {String} the value of the context variable.
   */
  render: function( context ){
    var output = context.get( this.lookup )
    if( output === null )
      return [VAR_TOKEN_MISSING_WARNING.fmt( this.lookup )];
    return [output];
  }
}

/**
 * A helper function used by Template.prototype.parse to 
 * create tokens. It parses the raw token string, replaces 
 * the delimiters and passes it on to the appropriate token 
 * function. Comment tokens are ignored, and strings (non-tokens)  
 * are returned unchanged.
 *  
 * @param {String} the raw string 
 * @param {Object} the parent of the token we're creating 
 * @param {Object} a reference to the main template 
 * @return {Mixed} VarToken, BlockToken, String or null
 */
var makeToken = function( string, parent, main ){
  // Create a block token  
  if(  string.match( blockTokenRegex ) ) {
    var matches;
    
    string = string.replace( blockTokenRegex, "" );
    if( !(matches = string.match( validBlockNameRegex ) ) )
      throw new E.TSE( "Invalid tag formation: '%s'".fmt(string) );
    
    return new BlockToken( 
      matches[0], string.replace( validBlockNameRegex, "" ).trim(), parent, main );
  }
  // Create a var token
  else if( string.match( varTokenRegex ) ) {
    string = string.replace( varTokenRegex, "" );
    if( !string.match( validVarNameRegex ) ){
      throw new E.TSE( "'%s' is not a valid variable name".fmt( string ) );
    }
    
    return new VarToken( string );
  }
  // Comments are ignored
  else if( string.match( commentTokenRegex ) )
    return null;
  // No need to turn strings into tokens
  else
    return string;
}

exports.makeToken = makeToken;
exports.setVarMissingWarning = function( bool ){
  VAR_TOKEN_MISSING_WARNING = bool ? "<span style='color:red'>Missing variable '%s'</span>" : "";
}
