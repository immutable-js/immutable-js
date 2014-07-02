var util         = require('util')
  , E           = require('../exceptions')
  , Template    = require('../template').Template;

exports['extends'] = EXTENDS;

/**
 * This is an extends tag, like in Django:
 * {% extends "filename.html" %} 
 * 
 * It must ALWAYS be the first thing in the template. 
 * You can also extend dynamically defined templates: 
 * {% extends files.template %} - notice the lack of quotes
 */
var validExtendsParamRegex = /^\s*(["']?)([^.][a-zA-Z0-9\-_.\/]+)\1\s*$/;
function EXTENDS( params, parent, main ) {
  var filepath;
  if( !( filepath = params.match( validExtendsParamRegex ) ) )
    throw new E.TSE( "Invalid filename in extends tag: '%s'".fmt( params ) );
  
  // This code is run before the token is pushed to the children
  // array so we can safely check for preceding tokens like this
  if( parent.children.length )
    throw new E.TSE("Extends tag is not at the beginning of template '%s'".fmt( parent.filepath ));

  // If template is blocking increase the blocked counter onthe main template
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

EXTENDS.renderFunction = function(context, callback, blocks ) {
  if( this.lazy ) {
    var filepath;
    if( !( filepath = context.getPath( this.lazy ) ) )
      throw new E.TE( "Variable '%s' is not a valid filename".fmt( this.lazy ) );

    new Template( filepath, this.main ).load(function( err, template ){
      if( err )
        callback( err, null );
      else
        template.render( context, callback, blocks );
    });
  }
  else
    return [this.template.render( context, callback, blocks )];
}
