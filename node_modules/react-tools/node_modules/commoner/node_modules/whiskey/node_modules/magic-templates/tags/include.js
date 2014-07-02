var util         = require('util')
  , E           = require('../exceptions')
  , Template    = require('../template').Template;

exports.include = INCLUDE;

/**
 * Ninja string is a hack that alows us to change the 
 * contents of the string after we have pushed it into 
 * the rendering output.
 */
function ninjaString( value ){ this.value = value || []; }
ninjaString.prototype = {
  toString: function(){ return this.value.join(""); }
};


/**
 * This is an include tag, like in Django:
 * {% include "filename.html" %} 
 *  
 * The include does not render any blocks defined in it. 
 * 
 * You can also include dynamically defined templates: 
 * {% include files.template %} - notice the lack of quotes
 */
var validIncludeParamRegex = /^\s*(["']?)([^.][a-zA-Z0-9\-_.\/]+)\1\s*$/;
function INCLUDE( params, parent, main ) {
  var filepath;
  if( !( filepath = params.match( validIncludeParamRegex ) ) )
    throw new E.TSE( "Invalid filename in include tag: '%s'".fmt( params ) );
  
  // If template is blocking it will bubble up to this token's parent.
  if( filepath[1] === "'" || filepath[1] === '"' ) {
    this.template = new Template( filepath[2], main );
    this.template.load();
  }
  // Filename is in a context var - parse template on render
  else {
    this.lazy = filepath[2];
    this.main = main;
  }
}

INCLUDE.renderFunction = function( context ){
  var filepath;
  if( this.lazy ) {
    if( !( filepath = context.getPath( this.lazy ) ) )
      throw new E.TE( "Variable '%s' is not a valid filename".fmt( lazy ) );

    var ns = new ninjaString(), frozen = context.clone();
    
    new Template( filepath, this.main ).load( function( err, template ){
      if( template ) 
        ns.value = template.render( frozen );
    });
    return ns;
  }
  else 
    return this.template.render( context );
}
