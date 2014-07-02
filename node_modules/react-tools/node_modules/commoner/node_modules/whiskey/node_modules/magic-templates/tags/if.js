var E           = require('../exceptions')
  , getProto    = Object.getPrototypeOf
  , isArray     = Array.isArray;

exports['if']     = IF;
exports['else']   = ELSE;

/**
 * This is an IF tag, like in Django.
 * It can contain 'else' and 'else if' tags inside.
 */
var validIfParamRegex = /^(["']?.+?["']?)( ?(==|>=|<=|\!=|<|>| in ) ?(["']?.+?["']?))?$/;
function IF( params, parent ) {
  var matches;
  this.branches=[];

  if( !( matches = params.match(validIfParamRegex) ) )
    throw new E.TSE( "Invalid 'if' tag syntax: '%s'".fmt(params) );

  this.var1     = matches[1];
  this.var2     = matches[4];
  this.operator = matches[3] && matches[3].trim();
}

IF.compileFunction = function() {
  var c
    , i=0
    , curr=0
    , lastToken = false
    , children = this.children
    , branches = this.branches
    , j = children.length;

  branches.push({ v1:this.var1, v2:this.var2, op:this.operator, start:0, end:j });
  for( ; i<j; i++ ) {
    c = children[i];
    if( c.tagname === 'else' ) {

      if( lastToken ) throw new E.TSE("Ivalid placement of 'else' tag within and 'if' block");
      if( c.plain ) lastToken = true; // a plain else tag must be the last one in the if block

      branches[curr].end = i;
      // start is i+1 because we skip this else token - it doesn't render
      branches.push({ v1:c.var1, v2:c.var2, op:c.operator, start:i+1, end:j });
      ++curr;
    }
  }
}

IF.renderFunction = function( context ){
  var i, j, op, v1, v2, branch
    , branches = this.branches
    , found  = false;

  for( i=0, j=branches.length; i<j; ++i  ) {
    branch = branches[i];
    v1 = branch.v1;
    v2 = branch.v2;
    op = branch.op;

    if (is_literal_string_value(v1)) {
      v1 = strip_quotes_from_literal_string_value(v1);
    }
    else {
      v1 = !isNaN(+v1) ? (+v1) : context.getPath( v1 );
    }

    if(v2) {
      if (is_literal_string_value(v2)) {
        v2 = strip_quotes_from_literal_string_value(v2);
      }
      else {
        v2 = !isNaN(+v2) ? (+v2) : context.getPath( v2 );
      }
    }
    if( op )
      found =
          op === "==" ? v1 === v2
        : op === "<=" ? v1 <=  v2
        : op === ">=" ? v1 >=  v2
        : op === "!=" ? v1 !== v2
        : op === "<"  ? v1  <  v2
        : op === ">"  ? v1  >  v2
        // Execute 'in' operator (only option left)
        : isArray(v2) || typeof v2 === 'string' ? v2.indexOf(v1) > -1
        : typeof v2 === 'object' ? v1 in v2
        : false;

    else if( v1 )
      found = true;

    if( found )
      break;
  }

  if( !found )
    return [];

  return getProto(this).render.call(this, context, this.children.slice( branch.start, branch.end ));
}

IF.expectsClosing = true;

/*
 * Return true if value is a string and contains quotes at the beginning and the end.
 */
function is_literal_string_value(value) {
  if ((typeof(value) === 'string' && (value.length >= 3)) &&
     ((value[0] == '"' && value[value.length - 1] == '"') || (value[0] == '\'' && value[value.length - 1] == '\''))) {
    return true;
  }

  return false;
}

/*
 * Remove quotes from the beginning and end of a string.
 */
function strip_quotes_from_literal_string_value(value) {
  return value.substring(1, value.length - 1);
}

/**
 * This is an else (with an optional if) tag.
 */
var removeIfRegex = /^if +/;
function ELSE( params, parent ){
  var matches, branches=[];

  if( parent.tagname !== 'if' )
    throw new E.TSE( "'else' tag encountered outside an 'if' block" );

  if( params === "" ) {
    this.plain = true; // This is a plain else tag, not an 'else if'
    this.var1  = true;
    return;
  }

  params = params.replace(removeIfRegex, "");
  if( !( matches = params.match(validIfParamRegex) ) )
    throw new E.TSE( "Invalid 'else if' tag syntax: '%s'".fmt(params) );

  this.var1      = matches[1];
  this.var2      = matches[4];
  this.operator  = matches[3] && matches[3].trim();
};
