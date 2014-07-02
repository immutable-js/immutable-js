var util         = require('util')
  , E           = require('../exceptions');

exports.block = BLOCK;

/**
 * This is a block tag, like in Django
 * {% block blockname %} 
 *  ... html ... 
 *  ... other tags ... 
 *  ... more html ... 
 * {% endblock %} 
 * 
 */
var validBlockParamRegex = /^\s*([a-zA-Z0-9\-_]+)\s*$/;
function BLOCK( params ){
  var match;
  if( !( match = params.match( validBlockParamRegex ) ) )
    throw new E.TSE( "Invalid block name %s".fmt( params ) );

  this.tagname  = "block";
  this.name     = match[1];
}
BLOCK.expectsClosing = true;
