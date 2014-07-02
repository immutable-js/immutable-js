/** 
 * The next code is only for the standalone version of the templates system. 
 * Dependencies: 
 *  Object.merge() 
 *  Object.getPath()  
 *  String.prototype.fmt() which is a wrapper around sprintf()
 * 
 * Since the Templates engine is pulled out of a larger framework, 
 * we conditionally define some dependencies if they're missing here. 
 * I know it's ugly, will fix it.
 *  
 * Huge thanks to TJ Holowaychuk <http://tjholowaychuk.com/>,  
 * this is mostly his code from the 'ext' nodejs module.
 */
if( typeof Object.merge !== 'function' || typeof Object.getPath !== 'function' || 
    typeof String.prototype.fmt !== 'function' ){

  var extend = function(obj, props) {
    Object.getOwnPropertyNames(props).forEach(function(prop){
      var descriptor = Object.getOwnPropertyDescriptor(props, prop);
      descriptor.enumerable = false;
      Object.defineProperty(obj, prop, descriptor);
    });
  }
  
  if( typeof Object.merge !== 'function' )
    extend(Object, {merge:function (a, b) {
      if (!b) 
        return a;
      var keys = Object.keys(b);
      for (var i = 0, len = keys.length; i < len; ++i)
        a[keys[i]] = b[keys[i]];
      return a;
    }});
  
  if( typeof Object.getPath !== 'function' )
    extend(Object, {getPath:function( obj, path ){
      var p = Array.isArray(path) ? path : path.split(".");
      for( var i=0, j=p.length; i<j; ++i )
        if( !(obj = obj[ p[ i ] ]) )
          break;
      return obj;
    }});
  
  if( typeof String.prototype.fmt !== 'function' )
  {
    var sprintf = function(str) {
      var args = arguments, i = 0
      return str.replace(/%(-)?(\d+)?(\.\d+)?(\w)/g, function(_, flag, width, precision, specifier){
        var arg = args[++i],
            width = parseInt(width),
            precision = parseInt((String(precision)).slice(1))
        function pad(str) {
          if (typeof str != 'string') return str
          return width
            ? flag == '-'
              ? str.padRight(width)
              : str.padLeft(width)
            : str
        }
        function numeric(str, base, fn) {
          fn = fn || parseInt
          return isNaN((fn)(str)) ?
            error('%' + specifier + ' requires a number of a numeric string') :
              (fn)(str).toString(base)
        }
        switch (specifier) {
          case 'c':
            switch (typeof arg) {
              case 'string': return pad(arg.charAt(0))
              case 'number': return pad(String.fromCharCode(arg))
              default:       error('%c requires a string or char code integer')
            }
          case 'M':
            return typeof arg == 'string' ?
              pad(arg.md5) :
                error('%M requires a string')
          case 's':
            return pad(arg)
          case 'C':
            return pad(Number.prototype.__lookupGetter__('currency')
                             .call(parseFloat(numeric(arg, 10, parseFloat)).toFixed(2)))
          case 'd':
            return pad(numeric(arg))
          case 'M':
            return pad(numeric(arg))
          case 'D':
            return pad(parseInt(numeric(arg)).ordinalize)
          case 'f':
            arg = numeric(arg, 10, parseFloat)
            if (precision) arg = parseFloat(arg).toFixed(precision)
            return pad(arg)
          case 'b':
            return pad(numeric(arg, 2))
          case 'o':
            return pad(numeric(arg, 8))
          case 'x':
          case 'X':
            arg = numeric(arg, 16)
            if (specifier == 'X') arg = arg.uppercase
            return pad(arg.length === 1 ? '0' + arg : arg)
          default:
            error('%' + specifier + ' is not a valid specifier')
        }
      })
    }
    String.prototype.fmt = function(){
      var args = Array.prototype.slice.call( arguments );
      args.unshift( this );
      return sprintf.apply( this, args );
    }
  }
}