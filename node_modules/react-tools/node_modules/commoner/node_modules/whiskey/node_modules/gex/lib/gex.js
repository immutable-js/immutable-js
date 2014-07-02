
var _ = require('underscore')


function Gex(gexexp) {
  var self = this

  var gexstr = ''+gexexp
  if( _.isNull(gexexp)
      || _.isNaN(gexexp) 
      || _.isUndefined(gexexp) ) {
    gexstr = ''
  } 
    
  gexstr = gexstr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  gexstr = gexstr.replace(/\\\*/g,'.*')
  gexstr = gexstr.replace(/\\\?/g,'.')
  gexstr = '^'+gexstr+'$'

  var re = new RegExp(gexstr)


  function dodgy(obj) {
    return ( _.isNull(obj)
             || _.isNaN(obj) 
             || _.isUndefined(obj) )
  }

  self.on = function(obj) {
    if( _.isString(obj) 
        || _.isNumber(obj) 
        || _.isBoolean(obj) 
        || _.isDate(obj) 
        || _.isRegExp(obj) 
      ) 
    {
      return (!!re.exec(''+obj)) ? obj : null
    }

    else if( _.isArray(obj)
             || _.isArguments(obj)
           ) {
      var out = []
      for( var i = 0; i < obj.length; i++ ) {
        if( !dodgy(obj[i]) && !!re.exec(''+obj[i]) ) {
          out.push(obj[i])
        }
      }
      return out
    }

    else if( dodgy(obj) ) {
      return null
    }
    
    else if( 'object' == typeof(obj) ) {
      var out = {}
      for( var p in obj ) {
        if( obj.hasOwnProperty(p) ) {
          if( !!re.exec(p) ) {
            out[p] = obj[p]
          }
        }
      }
      return out
    }

    else {
      return null
    }
  }
}


function gex(gexexp) {
  var gex = new Gex(gexexp)
  return gex
}
gex.Gex = Gex


module.exports = gex