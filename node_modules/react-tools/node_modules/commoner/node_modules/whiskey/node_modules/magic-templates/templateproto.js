var fs                = require('fs')
  , util               = require('util')
  , path              = require('path')
  , events            = require('events')
  , isArray           = Array.isArray

    // Dependencies on template modules
  , E                 = require('./exceptions')
  , Context           = require('./context').Context
  , Template          = require('./template').Template
  , makeToken         = require('./tokens').makeToken

    // These are also defined in tokens module
  , STRING_TOKEN      = 1
  , BLOCK_TOKEN       = 2
  , BLOCK_TOKEN_END   = 3
  , VAR_TOKEN         = 4

    // Some globals
  , USE_CACHE         = global.SETTINGS ? !SETTINGS.DEBUG : false
  , TEMPLATES_DIR     = global.SETTINGS ? SETTINGS.TEMPLATES_DIR : ""

  // Splits template by tags
  , tagRegex = /(\{%.*?%\}|\{\{.*?\}\}|\{#.*?#\})/;

Template.prototype = {

  /**
   * Loads the template file and executes _callback_ when done.
   * The callback is required and will be provided a reference
   * to the template itself. A typical callback will render the
   * template and finish the response. Example:
   *
   * {{{
   *  template.load(function( template ){
   *    template.render( context, function( result ){
   *      response.write( result );
   *    });
   *  });
   * }}}
   *
   * _load_ will first look in the cache, and execute the callback
   * If it doesn't find anything in the cache it will read and parse
   * the file and then execute the callback.
   *
   * When a file needs to be read, the template sets up an eventEmitter
   * that will fire when the template, and all it's subtemplates are ready.
   * The function listening for events will fire the callback and unregister
   * iteself so that it doesn't fire again.
   *
   * @param {Function} A callback to execute when loading is done.
   */
  load: function( callback ) {
    var filepath = this.filepath
      , cb = typeof callback === "function";

    // No errors could happen in here
    if( filepath in Template.cache ) {
      this.children = Template.cache[ filepath ];
      cb && callback( false, this );
    }

    else { // We need to perform blocking I/O
      this.children = [];
      var self = this;

      this.main.blocked++;
      this.emitter = new events.EventEmitter();

      fs.readFile( path.join( TEMPLATES_DIR, filepath ), function( err, buf ){
        if( err )
          self.main._err = new E.TE("'%s' with file '%s'. Missing a template?".fmt(err,filepath));

        else try {
          self.parse( buf.toString('utf8', 0, buf.length) ); // This may increase blocked counter
          USE_CACHE && ( Template.cache[ filepath ] = self.children );
        } catch( e ) { self.main._err = e; }

        if( --self.main.blocked === 0 )
          self.main.emitter.emit( 'ready' );
      });

      cb && self.main.emitter.addListener( 'ready', function() {
        self.main.emitter.removeListener( 'ready', arguments.callee );
        callback( self.main._err, self );
      });
    }
  }

  /**
   * Parses the raw file data by splitting it into chunks.
   * Each chunk is either a template tag string or a HTML string.
   * The template tags are converted into tokens using _makeToken()_.
   * The chunks are pushed into the _children_ array. When all is done
   * we have the template ready to be rendered. The _children_ array is
   * cached.
   *
   * @param {String} the template file (or string)
   */
  , parse: function( data ){
    var tokens  = data.trim().replace( /(^\n+)|(\n+$)/, "" ).split( tagRegex )
      , stack   = [ this ]  // a stack for nested block tags
      , si      = 0         // last element in the stack
      , i, token;

    for( i=0; i<tokens.length; ++i ) {
      // Ignore empty strings
      if( tokens[i].length === 0 )
        continue;

      token = makeToken( tokens[i], stack[ si ], this.main );

      if( token === null )
        continue; // comment

      if( token.type === BLOCK_TOKEN ) {
        stack[ si ].children.push( token );
        if( token.children ) {
          ++si;
          stack.push( token );
        }
      }
      else if( token.type === BLOCK_TOKEN_END  ) {
        --si;
        stack.pop().compile();
      }
      else if( !token )
        continue;
      else
        stack[ si ].children.push( token );
    }
    if( stack[ si ] !== this )
      throw new E.TSE("Unclosed '%s' tag in template '%s'".fmt(stack[si].tagname,this.filepath));

    return this;
  }

  /**
   * Produces a HTML string from the template tokens and
   * a supplied context. The rendering can be synchronous or
   * asynchronous, depending on the context. Some tags, like
   * _extend_ or _include_ have to read files. If the filenames
   * are not hard-coded in the template, but are supplied through
   * the context, the reading will happen in the render phase
   * (unless they are cached of course).
   *
   * You must always continue your code in the passed callback if
   * you expect blocking I/O in the render phase. See _load()_ for
   * an example. The callback will recieve 1 argument - the rendered
   * HTML string - ready for response. If a callback is not supplied
   * _render()_ will return the results.
   *
   * One special case is the _extends_ tag. When this tag is encountered
   * the current template is abandoned, all blocks from the template are
   * fetched and passed the _extends_ template and the output of *that*
   * template is returned. The original callback is also passed on. Otherwise
   * the _render()_ method of each token is called and appended to the result.
   *
   * @param {Hash} the context to render
   * @param {Function} a callback in case we expect file reads to happen
   * @param {Hash} all blocks from the templates that inherit this one.
   * @return {Mixed} a string or - if callback is supplied - nothing
   */
  , render: function( context, callback, blocks ) {
    var i, token
      , cb = typeof callback === 'function'
      , emitter = this.main.emitter
      , output = []
      , self = this
      , tokens = this.children
      , myblocks = this.getBlocks();
    blocks = Object.merge( myblocks, blocks );

    if( !(context instanceof Context) )
      context = new Context( context || {} );

    try {
    // tokens.length may change; we need to recalculate it
      for( i=0; i < tokens.length; ++i ) {
        token = tokens[ i ];

        // Base template is rendered instead of this one.
        // If 'extends' tag is used, there must be a callback.
        if( token.tagname === 'extends' )
          if( cb )
            return token.render( context, callback, blocks );
          else {
            output = output.concat( token.render( context, callback, blocks ) );
            break;
          }

        // Blocks in parent templates are overwriten
        else if( token.tagname === 'block' && token.name in blocks )
          output = output.concat( blocks[ token.name ].render( context ) );

        // Default to token's render method if there is one
        else if( token.render )
          output = output.concat( token.render( context ) );

        // If not, it's a string
        else
          output = output.concat( token );
      } // endfor
    } catch( e ){
      this.main._err = e;
    }

    if( !callback )
      return output;

    else if( this.main.blocked )
      emitter.addListener('ready', function() {
        emitter.removeListener( 'ready', arguments.callee );
        callback( self.main._err, output );
      });
    else
      callback( this.main._err, output );
  }

  /**
   * Get all 'block' template tags from this template
   */
  , getBlocks: function(){
    var i, j, t, blocks = {};
    for( i=0, j = this.children.length; i < j; ++i ){
      t = this.children[i];
      t.tagname === 'block' && ( blocks[ t.name ] = t );
    }
    return blocks;
  }
}
/**
 * @var The template cache
 */
Template.cache = {};

// Export
exports.setTemplatesDir = function( dir ){ TEMPLATES_DIR = dir; }
exports.setCache = function( bool ){ USE_CACHE = !bool; }
