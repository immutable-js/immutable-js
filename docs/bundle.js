require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/index.js":[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=      Router,Route=$__0.Route,DefaultRoute=$__0.DefaultRoute,RouteHandler=$__0.RouteHandler;
var DocHeader = require('./DocHeader');
var DocOverview = require('./DocOverview');
var TypeDocumentation = require('./TypeDocumentation');
var defs = require('../../../resources/immutable.d.json');


var Documentation = React.createClass({displayName: 'Documentation',
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement(DocHeader, null), 
        React.createElement("div", {className: "pageBody", id: "body"}, 
          React.createElement("div", {className: "contents"}, 
            React.createElement(RouteHandler, null)
          )
        )
      )
    );
  }
});

var DocDeterminer = React.createClass({displayName: 'DocDeterminer',
  mixins: [ Router.State ],

  render: function () {
    var typeName = this.getParams().typeName;
    var memberName = this.getParams().memberName;

    var type = defs.Immutable;
    var typePath = typeName ? typeName.split('.') : [];
    type = typePath.reduce(
      function(type, name)  {return type && type.module && type.module[name];},
      type
    );
    if (typePath.length === 1 && !type.interface && !type.module) {
      memberName = typeName;
      typeName = null;
      type = defs.Immutable;
    }
    if (typeName) {
      return React.createElement(TypeDocumentation, null);
    } else {
      return React.createElement(DocOverview, {memberName: memberName});
    }
  }
});


module.exports = React.createClass({displayName: 'exports',
  componentWillMount: function() {
    Router.create({
      routes:
        React.createElement(Route, {handler: Documentation, path: "/"}, 
          React.createElement(DefaultRoute, {handler: DocDeterminer}), 
          React.createElement(Route, {name: "type", path: "/:typeName", handler: DocDeterminer}), 
          React.createElement(Route, {name: "method", path: "/:typeName/:memberName", handler: DocDeterminer})
        ),

      scrollBehavior: window.document && {
        updateScrollPosition: function (position, actionType) {
          switch (actionType) {
            case 'push': return window.scrollTo(0, 0);
            case 'pop': return window.scrollTo(
              position ? position.x : 0,
              position ? position.y : 0
            );
          }
        }
      }
    }).run(function(Handler)  {
      this.setState({handler: Handler});
    }.bind(this));
  },
  render: function () {
    var Handler = this.state.handler;
    return React.createElement(Handler, null);
  }
});

},{"../../../resources/immutable.d.json":62,"./DocHeader":2,"./DocOverview":3,"./TypeDocumentation":5,"react":undefined,"react-router":22}],1:[function(require,module,exports){
var React = require('react');
var CSSCore = require('react/lib/CSSCore');
var Router = require('react-router');
var $__0=    require('immutable'),Seq=$__0.Seq;
var TypeKind = require('../../../src/TypeKind');


var InterfaceDef = React.createClass({displayName: 'InterfaceDef',
  render: function() {
    var name = this.props.name;
    var def = this.props.def;
    return (
      React.createElement("span", {className: "t interfaceDef"}, 
        React.createElement("span", {className: "t typeName"}, name), 
        def.typeParams &&
          ['<', Seq(def.typeParams).map(function(t, k) 
            {return React.createElement("span", {className: "t typeParam", key: k}, t);}
          ).interpose(', ').toArray(), '>'], 
        
        def.extends && [
          React.createElement("span", {className: "t keyword"}, ' extends '),
          Seq(def.extends).map(function(e, i) 
            {return React.createElement(TypeDef, {key: i, type: e});}
          ).interpose(', ').toArray()
        ], 
        def.implements && [
          React.createElement("span", {className: "t keyword"}, ' implements '),
          Seq(def.implements).map(function(e, i) 
            {return React.createElement(TypeDef, {key: i, type: e});}
          ).interpose(', ').toArray()
        ]
      )
    );
  }
});

exports.InterfaceDef = InterfaceDef;


var CallSigDef = React.createClass({displayName: 'CallSigDef',
  render: function() {
    var module = this.props.module;
    var name = this.props.name;
    var callSig = this.props.callSig || {};

    var shouldWrap = callSigLength(module, name, callSig) > 80;

    return (
      React.createElement("span", {className: "t callSig"}, 
        module && [React.createElement("span", {className: "t fnQualifier"}, module), '.'], 
        React.createElement("span", {className: "t fnName"}, name), 
        callSig.typeParams &&
          ['<', Seq(callSig.typeParams).map(function(t) 
            {return React.createElement("span", {className: "t typeParam"}, t);}
          ).interpose(', ').toArray(), '>'], 
        
        '(', 
        callSig && functionParams(callSig.params, shouldWrap), 
        ')', 
        callSig.type && [': ', React.createElement(TypeDef, {type: callSig.type})]
      )
    );
  }
});

exports.CallSigDef = CallSigDef;


var TypeDef = React.createClass({displayName: 'TypeDef',
  render: function() {
    var type = this.props.type;
    switch (type.k) {
      case TypeKind.Any: return this.wrap('primitive', 'any');
      case TypeKind.Boolean: return this.wrap('primitive', 'boolean');
      case TypeKind.Number: return this.wrap('primitive', 'number');
      case TypeKind.String: return this.wrap('primitive', 'string');
      case TypeKind.Object: return this.wrap('object', [
        '{',
        Seq(type.members).map(function(t) 
          {return React.createElement(MemberDef, {member: t});}
        ).interpose(', ').toArray(),
        '}'
      ]);
      case TypeKind.Array: return this.wrap('array', [
        React.createElement(TypeDef, {type: type.type}), '[]'
      ]);
      case TypeKind.Function: return this.wrap('function', [
        '(', functionParams(type.params), ') => ', React.createElement(TypeDef, {type: type.type})
      ]);
      case TypeKind.Param: return this.wrap('typeParam', type.param);
      case TypeKind.Type: return this.wrap('type', [
        React.createElement(Router.Link, {to: '/' + (type.qualifier ? type.qualifier.join('.') + '.' : '') + type.name}, 
          type.qualifier && [Seq(type.qualifier).map(function(q) 
            {return React.createElement("span", {className: "t typeQualifier"}, q);}
          ).interpose('.').toArray(), '.'], 
          React.createElement("span", {className: "t typeName"}, type.name)
        ),
        type.args && ['<', Seq(type.args).map(function(a) 
          {return React.createElement(TypeDef, {type: a});}
        ).interpose(', ').toArray(), '>']
      ]);
    }
    throw new Error('Unknown kind ' + type.k);
  },

  mouseOver: function(event) {
    CSSCore.addClass(this.getDOMNode(), 'over');
    event.stopPropagation();
  },

  mouseOut: function() {
    CSSCore.removeClass(this.getDOMNode(), 'over');
  },

  wrap: function(className, child) {
    return (
      React.createElement("span", {
        className: 't ' + className, 
        onMouseOver: this.mouseOver, 
        onMouseOut: this.mouseOut}, 
        child
      )
    );
  }
});

exports.TypeDef = TypeDef;


var MemberDef = React.createClass({displayName: 'MemberDef',
  render: function() {
    var module = this.props.module;
    var member = this.props.member;
    return (
      React.createElement("span", {className: "t member"}, 
        module && [React.createElement("span", {className: "t fnQualifier"}, module), '.'], 
        member.index ?
          ['[', functionParams(member.params), ']'] :
          React.createElement("span", {className: "t memberName"}, member.name), 
        member.type && [': ', React.createElement(TypeDef, {type: member.type})]
      )
    );
  }
});

exports.MemberDef = MemberDef;


function functionParams(params, shouldWrap) {
  var elements = Seq(params).map(function(t)  {return [
    t.varArgs ? '...' : null,
    React.createElement("span", {className: "t param"}, t.name),
    t.optional ? '?: ' : ': ',
    React.createElement(TypeDef, {type: t.type})
  ];}).interpose(shouldWrap ? [',', React.createElement("br", null)] : ', ').toArray();
  return shouldWrap ?
    React.createElement("div", {className: "t blockParams"}, elements) :
    elements;
}

function callSigLength(module, name, sig) {
  return (
    (module ? module.length + 1 : 0) +
    name.length +
    (sig.typeParams ? 2 + sig.typeParams.join(', ').length : 0) +
    2 + (sig.params ? paramLength(sig.params) : 0) +
    (sig.type ? 2 + typeLength(sig.type) : 0)
  );
}

function paramLength(params) {
  return params.reduce(function(s, p) 
    {return s +
    (p.varArgs ? 3 : 0) +
    p.name.length +
    (p.optional ? 3 : 2) +
    typeLength(p.type);},
    (params.length - 1) * 2
  );
}

function memberLength(members) {
  return members.reduce(function(s, m) 
    {return s + (m.index ? paramLength(m.params) + 4 : m.name + 2) +
    typeLength(m.type);},
    (members.length - 1) * 2
  );
}

function typeLength(type) {
  switch (type.k) {
    case TypeKind.Any: return 3;
    case TypeKind.Boolean: return 7;
    case TypeKind.Number: return 6;
    case TypeKind.String: return 6;
    case TypeKind.Object: return 2 + memberLength(type.members);
    case TypeKind.Array: return typeLength(type.type) + 2;
    case TypeKind.Function:
      return paramLength(type.params) + 6 + typeLength(type.type);
    case TypeKind.Param: return type.param.length;
    case TypeKind.Type: return (
      (type.qualifier ? 1 + type.qualifier.join('.').length : 0) +
      type.name.length +
      (!type.args ? 0 :
        type.args.reduce(function(s, a)  {return s + typeLength(a);}, type.args.length * 2))
    );
  }
  throw new Error('Unknown kind ' + type.k);
}

},{"../../../src/TypeKind":63,"immutable":undefined,"react":undefined,"react-router":22,"react/lib/CSSCore":54}],2:[function(require,module,exports){
var React = require('react');
var SVGSet = require('../../src/SVGSet');
var Logo = require('../../src/Logo');


var DocHeader = React.createClass({displayName: 'DocHeader',

  render: function() {
    return (
      React.createElement("div", {className: "header"}, 
        React.createElement("div", {className: "miniHeader"}, 
          React.createElement("div", {className: "miniHeaderContents"}, 
            React.createElement("a", {href: "../", target: "_self", className: "logo"}, 
              React.createElement(SVGSet, null, 
                React.createElement(Logo, {color: "#FC4349"}), 
                React.createElement(Logo, {color: "#2C3E50", inline: true})
              )
            ), 
            React.createElement("a", {href: "./", target: "_self"}, "Documentation"), 
            React.createElement("a", {href: "https://github.com/facebook/immutable-js/issues/"}, "Support"), 
            React.createElement("a", {href: "https://github.com/facebook/immutable-js/"}, "Github")
          )
        )
      )
    );
  }
});

module.exports = DocHeader;

},{"../../src/Logo":6,"../../src/SVGSet":7,"react":undefined}],3:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=    require('immutable'),Seq=$__0.Seq;
var defs = require('../../../resources/immutable.d.json');
var MemberDoc = require('./MemberDoc');

var DocOverview = React.createClass({displayName: 'DocOverview',

  mixins: [ Router.State ],

  render: function() {
    var type = defs.Immutable;

    var doc = type.doc;
    var functions = Seq(type.module).filter(function(t)  {return !t.interface && !t.module;});
    var types = Seq(type.module).filter(function(t)  {return t.interface || t.module;});

    var memberName = this.props.memberName;

    return (
      React.createElement("div", null, 

        doc && React.createElement("section", null, 
          React.createElement("pre", null, doc.synopsis), 
          doc.description && React.createElement("pre", null, doc.description)
        ), 

        functions.count() > 0 &&
          React.createElement("section", null, 
            React.createElement("h2", null, "Functions"), 
            functions.map(function(t, name) 
              {return React.createElement(MemberDoc, {key: name, showDetail: name === memberName, member: {
                memberName: name,
                memberDef: t.call,
                isStatic: true
              }});}
            ).toArray()
          ), 
        

        types.count() > 0 &&
          React.createElement("section", null, 
            React.createElement("h2", null, "Types"), 
            types.map(function(t, name) 
              {return React.createElement("div", {key: name}, 
                React.createElement(Router.Link, {to: '/' + name}, 
                  name
                ), 
                t.doc && React.createElement("div", null, 
                  t.doc.synopsis
                )
              );}
            ).toArray()
          )
        

      )
    );
  }
});

module.exports = DocOverview;

},{"../../../resources/immutable.d.json":62,"./MemberDoc":4,"immutable":undefined,"react":undefined,"react-router":22}],4:[function(require,module,exports){
var React = require('react');
var $__0=     React.addons,classSet=$__0.classSet,TransitionGroup=$__0.TransitionGroup;
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');
var Router = require('react-router');
var $__1=     require('./Defs'),CallSigDef=$__1.CallSigDef,MemberDef=$__1.MemberDef;


var MemberDoc = React.createClass({displayName: 'MemberDoc',
  mixins: [ Router.Navigation ],

  getInitialState: function() {
    var showDetail = this.props.showDetail;
    return { detail: showDetail };
  },

  toggleDetail: function() {
    var member = this.props.member;
    var name = member.memberName;
    var typeName = this.props.parentName;
    var showDetail = this.props.showDetail;
    if (!this.state.detail) {
      this.replaceWith('/' + (typeName ? typeName + '/' : '') + name );
    } else if (this.state.detail && showDetail) {
      this.replaceWith('/' + (typeName || '') );
    }
    this.setState({ detail: !this.state.detail });
  },

  render: function() {
    var member = this.props.member;
    var module = member.isStatic ? this.props.parentName : null;
    var name = member.memberName;
    var def = member.memberDef;
    var doc = def.doc || {};
    var isProp = !def.signatures;

    var className = classSet({
      memberLabel: true,
      open: this.state.detail,
    });

    return (
      React.createElement("div", {className: "interfaceMember"}, 
        React.createElement("div", {onClick: this.toggleDetail, className: className}, 
          isProp ?
            React.createElement(MemberDef, {module: module, member: {name:name}}) :
            React.createElement(CallSigDef, {module: module, name: name}), 
          member.inherited && React.createElement("span", {className: "inherited"}, "inherited"), 
          member.overrides && React.createElement("span", {className: "override"}, "override")
        ), 
        React.createElement(TransitionGroup, {childFactory: makeSlideDown}, 
          this.state.detail &&
            React.createElement("div", {key: "detail", className: "detail"}, 
              doc.synopsis && React.createElement("pre", null, doc.synopsis), 
              React.createElement("h4", {className: "infoHeader"}, 
                'Definition' + (def.signatures && def.signatures.length !== 1 ? 's' : '')
              ), 
              isProp ?
                React.createElement("div", {className: "codeBlock memberSignature"}, 
                  React.createElement(MemberDef, {module: module, member: {name:name, type: def.type}})
                ) :
                def.signatures.map(function(callSig) 
                  {return React.createElement("div", {className: "codeBlock memberSignature"}, 
                    React.createElement(CallSigDef, {module: module, name: name, callSig: callSig})
                  );}
                ), 
              
              member.inherited &&
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, 
                    "Inherited from"
                  ), 
                  React.createElement(Router.Link, {to: '/' + member.inherited.name + '/' + name}, 
                    member.inherited.name + '#' + name
                  )
                ), 
              
              member.overrides &&
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, 
                    "Overrides"
                  ), 
                  React.createElement(Router.Link, {to: '/' + member.overrides.name + '/' + name}, 
                    member.overrides.name + '#' + name
                  )
                ), 
              
              doc.notes && doc.notes.map(function(note) 
                {return React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, 
                    note.name
                  ), 
                  
                    note.name === 'alias' ?
                      React.createElement(CallSigDef, {name: note.body}) :
                    note.body
                  
                );}
              ), 
              doc.description &&
                React.createElement("section", null, 
                  React.createElement("h4", {className: "infoHeader"}, 
                    "Discussion"
                  ), 
                  React.createElement("pre", null, doc.description)
                )
              
            )
          
        )
      )
    );
  }
});


function makeSlideDown(child) {
  return React.createElement(SlideDown, null, child)
}

var SlideDown = React.createClass({displayName: 'SlideDown',
  componentWillEnter: function(done) {
    this.slide(false, done);
  },

  componentWillLeave: function(done) {
    this.slide(true, done);
  },

  slide: function(slidingUp, done) {
    var node = this.getDOMNode();
    node.style.height = 'auto';
    var height = getComputedStyle(node).height;
    var start = slidingUp ? height : 0;
    var end = slidingUp ? 0 : height;
    node.style.transition = '';
    node.style.height = start;
    node.style.transition = 'height 0.35s ease-in-out';
    var endListener = function(event)  {
      ReactTransitionEvents.removeEndEventListener(node, endListener);
      done();
    };
    ReactTransitionEvents.addEndEventListener(node, endListener);
    this.timeout = setTimeout(function()  {
      node.style.height = end;
    }, 17);
  },

  render: function() {
    return this.props.children;
  }
});

module.exports = MemberDoc;

},{"./Defs":1,"react":undefined,"react-router":22,"react/lib/ReactTransitionEvents":57}],5:[function(require,module,exports){
var React = require('react');
var Router = require('react-router');
var $__0=    require('immutable'),Seq=$__0.Seq;
var defs = require('../../../resources/immutable.d.json');
var $__1=    require('./Defs'),InterfaceDef=$__1.InterfaceDef;
var MemberDoc = require('./MemberDoc');


var TypeDocumentation = React.createClass({displayName: 'TypeDocumentation',
  mixins: [ Router.State ],

  getInitialState: function() {
    return {
      showInherited: true,
      showInGroups: true,
    };
  },

  toggleShowInGroups: function() {
    this.setState({ showInGroups: !this.state.showInGroups });
  },

  toggleShowInherited: function() {
    this.setState({ showInherited: !this.state.showInherited });
  },

  render: function() {
    var type = defs.Immutable;
    var typeName = this.getParams().typeName;
    var typePath = typeName ? typeName.split('.') : [];
    type = typePath.reduce(
      function(type, name)  {return type && type.module && type.module[name];},
      type
    );
    if (!type) {
      return React.createElement(NotFound, null);
    }

    var doc = type.doc;
    var call = type.call;
    var functions = Seq(type.module).filter(function(t)  {return !t.interface && !t.module;});
    var types = Seq(type.module).filter(function(t)  {return t.interface || t.module;});
    var interfaceDef = type.interface;

    var memberGroups = collectMemberGroups(interfaceDef, {
      showInGroups: this.state.showInGroups,
      showInherited: this.state.showInherited,
    });

    return (
      React.createElement("div", {key: typeName}, 

        React.createElement("div", {onClick: this.toggleShowInGroups}, "Toggle Groups"), 
        React.createElement("div", {onClick: this.toggleShowInherited}, "Toggle Inherited"), 
        React.createElement("h1", {className: "typeHeader"}, 
          interfaceDef ?
            React.createElement(InterfaceDef, {name: typeName, def: interfaceDef}) :
            typeName
          
        ), 

        doc && React.createElement("section", {className: "doc"}, 
          React.createElement("pre", null, doc.synopsis), 
          doc.description && React.createElement("pre", null, doc.description), 
          doc.notes && React.createElement("pre", null, doc.notes)
        ), 

        functions.count() > 0 &&
          React.createElement("section", null, 
            functions.map(function(t, name) 
              {return React.createElement(MemberDoc, {
                key: name, 
                showDetail: name === this.getParams().memberName, 
                parentName: typeName, 
                member: {
                  memberName: name,
                  memberDef: t.call,
                  isStatic: true
                }}
              );}.bind(this)
            ).toArray()
          ), 
        

        call &&
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, "Construction"), 
            React.createElement(MemberDoc, {
              showDetail: typeName === this.getParams().memberName, 
              parentName: typeName, 
              member: {
                memberName: typeName,
                memberDef: call
              }}
            )
          ), 
        

        types.count() > 0 &&
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, "Types"), 
            types.map(function(t, name) 
              {return React.createElement("div", {key: name}, 
                React.createElement(Router.Link, {to: '/' + (typeName?typeName+'.'+name:name)}, 
                  (typeName?typeName+'.'+name:name)
                )
              );}
            ).toArray()
          ), 
        

        Seq(memberGroups).map(function(members, title) 
          {return members.length === 0 ? null :
          React.createElement("section", null, 
            React.createElement("h4", {className: "groupTitle"}, title || 'Members'), 
            members.map(function(member) 
              {return React.createElement(MemberDoc, {
                key: member.memberName, 
                showDetail: member.memberName === this.getParams().memberName, 
                parentName: typeName, 
                member: member}
              );}.bind(this)
            )
          );}.bind(this)
        ).toArray()

      )
    );
  }
});

var NotFound = React.createClass({displayName: 'NotFound',
  render: function() {
    return React.createElement("div", null, 'Not found');
  }
});


function collectMemberGroups(interfaceDef, options) {
  var members = {};

  if (interfaceDef) {
    collectFromDef(interfaceDef);
  }

  var groups = {'':[]};

  if (options.showInGroups) {
    Seq(members).forEach(function(member)  {
      (groups[member.group] || (groups[member.group] = [])).push(member);
    });
  } else {
    groups[''] = Seq(members).sortBy(function(member)  {return member.memberName;}).toArray();
  }

  if (!options.showInherited) {
    groups = Seq(groups).map(
      function(members)  {return members.filter(function(member)  {return !member.inherited;});}
    ).toObject();
  }

  return groups;

  function collectFromDef(def, name) {

    def.groups && def.groups.forEach(function(g)  {
      Seq(g.properties).forEach(function(propDef, propName)  {
        collectMember(g.title || '', propName, propDef);
      });
      Seq(g.methods).forEach(function(methodDef, memberName)  {
        collectMember(g.title || '', memberName, methodDef);
      });
    });

    def.extends && def.extends.forEach(function(e)  {
      var superModule = defs.Immutable.module[e.name];
      var superInterface = superModule && superModule.interface;
      if (superInterface) {
        collectFromDef(superInterface, e.name);
      }
    });

    function collectMember(group, memberName, memberDef) {
      var member = members[memberName];
      if (member) {
        if (!member.inherited) {
          member.overrides = { name:name, def:def, memberDef:memberDef };
        }
        if (!member.group && group) {
          member.group = group;
        }
      } else {
        member = {
          group:group,
          memberName: memberName.substr(1),
          memberDef:memberDef
        };
        if (def !== interfaceDef) {
          member.inherited = { name:name, def:def };
        }
        members[memberName] = member;
      }
    }
  }
}

module.exports = TypeDocumentation;

},{"../../../resources/immutable.d.json":62,"./Defs":1,"./MemberDoc":4,"immutable":undefined,"react":undefined,"react-router":22}],6:[function(require,module,exports){
var React = require('react');


var Logo = React.createClass({displayName: 'Logo',

  shouldComponentUpdate: function(nextProps) {
    return nextProps.opacity !== this.props.opacity;
  },

  render: function() {
    var opacity = this.props.opacity;
    if (opacity === undefined) {
      opacity = 1;
    }
    return !this.props.inline ? (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z"}), 
        React.createElement("path", {d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z"}), 
        React.createElement("path", {d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z"}), 
        React.createElement("path", {d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z"}), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z"}), 
        React.createElement("path", {d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M194.1,28.4l-2.8-7.2l-2.8,7.2" + ' ' +
          "H194.1z"}), 
        React.createElement("path", {d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6" + ' ' +
          "c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z"}), 
        React.createElement("path", {d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z"})
      )
    ) : (
      React.createElement("g", {fill: this.props.color, style: { opacity: this.props.opacity}}, 
        React.createElement("path", {d: "M0,0l13.9,0v41.1H0L0,0z M7.8,36.2V4.9H6.2v31.3H7.8z"}), 
        React.createElement("path", {d: "M18.2,0L29,0l10.7,15.8L50.4,0l10.9,0v41.1H48.1V26.3l-8.4,12.3l-8.4-12.3v14.8H18.2V0z M25.9,36.2V7.9" + ' ' +
          "L39.7,28L53.5,7.9v28.3h1.6V4.9h-1.6L39.7,25.2L25.9,4.9h-1.6v31.3H25.9z"}), 
        React.createElement("path", {d: "M65.5,0l10.9,0L87,15.8L97.7,0l10.9,0v41.1H95.4V26.3L87,38.7l-8.4-12.3v14.8H65.5V0z M73.2,36.2V7.9" + ' ' +
          "L87,28l13.7-20.1v28.3h1.6V4.9h-1.6L87,25.2L73.2,4.9h-1.6v31.3H73.2z"}), 
        React.createElement("path", {d: "M128.6,42.2c-2.6,0-4.9-0.3-7-1c-2.1-0.7-3.9-1.6-5.4-3c-1.5-1.3-2.6-3-3.4-5c-0.8-2-1.2-4.4-1.2-7.1V0" + ' ' +
          "l13.1,0v25.6c0,1.4,0.3,2.5,0.9,3.3c0.6,0.8,1.6,1.1,3,1.1c1.4,0,2.4-0.4,3-1.1c0.6-0.8,0.9-1.9,0.9-3.3V0l13.2,0v26.1" + ' ' +
          "c0,2.7-0.4,5.1-1.2,7.1c-0.8,2-2,3.7-3.5,5c-1.5,1.3-3.3,2.3-5.4,3C133.5,41.8,131.2,42.2,128.6,42.2z M128.6,34.8" + ' ' +
          "c-6.2,0-9.2-3-9.2-9.1V4.9h-1.6v20.8c0,3.5,0.9,6.1,2.8,7.9c1.9,1.8,4.6,2.7,8,2.7c3.5,0,6.2-0.9,8.1-2.7c1.9-1.8,2.8-4.5,2.8-7.9" + ' ' +
          "V4.9h-1.7v20.8C137.8,31.7,134.8,34.8,128.6,34.8z"}), 
        React.createElement("path", {d: "M155.4,10.8h-7.6V0l28.7,0v10.8h-7.6v30.3h-13.6V10.8z M163,36.2V6.4h8.8V4.9h-19.2v1.5h8.8v29.8H163z"}), 
        React.createElement("path", {d: "M186.4,0l9.9,0l15.6,41.1h-12.9l-1.4-3.7h-12.5l-1.4,3.7h-12.9L186.4,0z M180,36.2l1.2-3.1h20.3l1.2,3.1" + ' ' +
          "h1.7L192.5,4.9h-2.3l-11.9,31.3H180z M191.3,6.4l9.6,25.2h-19.2L191.3,6.4z M194.1,28.4l-2.8-7.2l-2.8,7.2H194.1z"}), 
        React.createElement("path", {d: "M212.9,0L229,0c2.1,0,3.9,0.2,5.6,0.7c1.7,0.5,3.2,1.2,4.4,2.1s2.2,2.1,2.8,3.5c0.7,1.4,1,3,1,4.8" + ' ' +
          "c0,1.3-0.2,2.4-0.5,3.4c-0.3,0.9-0.7,1.7-1,2.3c-0.5,0.7-1,1.4-1.5,1.8c0.9,0.6,1.7,1.3,2.5,2.2c0.6,0.8,1.2,1.8,1.7,3" + ' ' +
          "c0.5,1.2,0.8,2.7,0.8,4.4c0,2-0.3,3.8-1,5.4c-0.7,1.6-1.7,3-3,4.1c-1.3,1.1-2.9,2-4.7,2.6c-1.9,0.6-4,0.9-6.3,0.9h-16.8V0z" + ' ' +
           "M228,36.2c3.6,0,6.3-0.8,8-2.3c1.7-1.6,2.6-3.6,2.6-6.2c0-1.7-0.4-3-1.1-4c-0.7-1-1.5-1.8-2.3-2.4c-1-0.7-2.2-1.1-3.4-1.4" + ' ' +
          "c1-0.3,1.9-0.7,2.7-1.4c0.7-0.5,1.3-1.3,1.9-2.2s0.8-2.1,0.8-3.5c0-2.6-0.8-4.5-2.5-5.9c-1.6-1.3-3.9-2-6.7-2h-8.9v31.3H228z" + ' ' +
           "M220.7,19.1V6.4l7.3,0c2.7,0,4.6,0.6,5.8,1.8c1.2,1.2,1.8,2.7,1.8,4.6c0,1.9-0.6,3.4-1.8,4.6c-1.2,1.2-3.1,1.8-5.8,1.8H220.7z" + ' ' +
           "M220.7,34.7V20.6h7.2c1.3,0,2.5,0.1,3.5,0.4c1.1,0.3,2,0.7,2.9,1.2c0.8,0.6,1.5,1.3,1.9,2.2c0.5,0.9,0.7,2,0.7,3.2" + ' ' +
          "c0,2.5-0.8,4.3-2.5,5.4c-1.7,1.1-3.9,1.7-6.6,1.7H220.7z M230.2,12.5c0-1.9-1-2.8-3.1-2.8h-1.5v5.7h1.5" + ' ' +
          "C229.2,15.4,230.2,14.4,230.2,12.5z M227.1,31.4c3.1,0,4.7-1.2,4.7-3.6c0-2.4-1.6-3.6-4.7-3.6h-1.5v7.2H227.1z"}), 
        React.createElement("path", {d: "M248.3,0L262,0v30.3h11.3v10.8h-25V0z M269.9,36.2v-1.5h-13.8V4.9h-1.6v31.3H269.9z"}), 
        React.createElement("path", {d: "M275.3,0l24.2,0v10.8h-11.1v4.6h10.9v10.2h-10.9v4.7H300v10.8h-24.7V0z M295.4,36.2v-1.5h-12.3V21.2h11.7" + ' ' +
          "v-1.5h-11.7V6.4h12.3V4.9h-13.9v31.3H295.4z"})
      )
    );
  }
});


module.exports = Logo;

},{"react":undefined}],7:[function(require,module,exports){
var React = require('react');


var SVGSet = React.createClass({displayName: 'SVGSet',
  render: function() {
    return (
      React.createElement("svg", {className: "svg", style: this.props.style, viewBox: "0 0 300 42.2"}, 
        this.props.children
      )
    );
  }
});


module.exports = SVGSet;

},{"react":undefined}],8:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":9,"ieee754":10,"is-array":11}],9:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],10:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],11:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],13:[function(require,module,exports){
/**
 * Actions that modify the URL.
 */
var LocationActions = {

  /**
   * Indicates a new location is being pushed to the history stack.
   */
  PUSH: 'push',

  /**
   * Indicates the current location should be replaced.
   */
  REPLACE: 'replace',

  /**
   * Indicates the most recent entry should be removed from the history stack.
   */
  POP: 'pop'

};

module.exports = LocationActions;

},{}],14:[function(require,module,exports){
var LocationActions = require('../actions/LocationActions');

/**
 * A scroll behavior that attempts to imitate the default behavior
 * of modern browsers.
 */
var ImitateBrowserBehavior = {

  updateScrollPosition: function (position, actionType) {
    switch (actionType) {
      case LocationActions.PUSH:
      case LocationActions.REPLACE:
        window.scrollTo(0, 0);
        break;
      case LocationActions.POP:
        if (position) {
          window.scrollTo(position.x, position.y);
        } else {
          window.scrollTo(0, 0);
        }
        break;
    }
  }

};

module.exports = ImitateBrowserBehavior;

},{"../actions/LocationActions":13}],15:[function(require,module,exports){
/**
 * A scroll behavior that always scrolls to the top of the page
 * after a transition.
 */
var ScrollToTopBehavior = {

  updateScrollPosition: function () {
    window.scrollTo(0, 0);
  }

};

module.exports = ScrollToTopBehavior;

},{}],16:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <DefaultRoute> component is a special kind of <Route> that
 * renders when its parent matches but none of its siblings do.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */
var DefaultRoute = React.createClass({

  displayName: 'DefaultRoute',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: PropTypes.falsy,
    handler: React.PropTypes.func.isRequired
  }

});

module.exports = DefaultRoute;

},{"../mixins/FakeNode":26,"../utils/PropTypes":35,"react":undefined}],17:[function(require,module,exports){
var React = require('react');
var classSet = require('react/lib/cx');
var assign = require('react/lib/Object.assign');
var Navigation = require('../mixins/Navigation');
var State = require('../mixins/State');

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

/**
 * <Link> components are used to create an <a> element that links to a route.
 * When that route is active, the link gets an "active" class name (or the
 * value of its `activeClassName` prop).
 *
 * For example, assuming you have the following route:
 *
 *   <Route name="showPost" path="/posts/:postID" handler={Post}/>
 *
 * You could use the following component to link to that route:
 *
 *   <Link to="showPost" params={{ postID: "123" }} />
 *
 * In addition to params, links may pass along query string parameters
 * using the `query` prop.
 *
 *   <Link to="showPost" params={{ postID: "123" }} query={{ show:true }}/>
 */
var Link = React.createClass({

  displayName: 'Link',

  mixins: [ Navigation, State ],

  propTypes: {
    activeClassName: React.PropTypes.string.isRequired,
    to: React.PropTypes.string.isRequired,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    onClick: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      activeClassName: 'active'
    };
  },

  handleClick: function (event) {
    var allowTransition = true;
    var clickResult;

    if (this.props.onClick)
      clickResult = this.props.onClick(event);

    if (isModifiedEvent(event) || !isLeftClickEvent(event))
      return;

    if (clickResult === false || event.defaultPrevented === true)
      allowTransition = false;

    event.preventDefault();

    if (allowTransition)
      this.transitionTo(this.props.to, this.props.params, this.props.query);
  },

  /**
   * Returns the value of the "href" attribute to use on the DOM element.
   */
  getHref: function () {
    return this.makeHref(this.props.to, this.props.params, this.props.query);
  },

  /**
   * Returns the value of the "class" attribute to use on the DOM element, which contains
   * the value of the activeClassName property when this <Link> is active.
   */
  getClassName: function () {
    var classNames = {};

    if (this.props.className)
      classNames[this.props.className] = true;

    if (this.isActive(this.props.to, this.props.params, this.props.query))
      classNames[this.props.activeClassName] = true;

    return classSet(classNames);
  },

  render: function () {
    var props = assign({}, this.props, {
      href: this.getHref(),
      className: this.getClassName(),
      onClick: this.handleClick
    });

    return React.DOM.a(props, this.props.children);
  }

});

module.exports = Link;

},{"../mixins/Navigation":27,"../mixins/State":30,"react":undefined,"react/lib/Object.assign":56,"react/lib/cx":58}],18:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <NotFoundRoute> is a special kind of <Route> that
 * renders when the beginning of its parent's path matches
 * but none of its siblings do, including any <DefaultRoute>.
 * Only one such route may be used at any given level in the
 * route hierarchy.
 */
var NotFoundRoute = React.createClass({

  displayName: 'NotFoundRoute',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: PropTypes.falsy,
    handler: React.PropTypes.func.isRequired
  }

});

module.exports = NotFoundRoute;

},{"../mixins/FakeNode":26,"../utils/PropTypes":35,"react":undefined}],19:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');
var PropTypes = require('../utils/PropTypes');

/**
 * A <Redirect> component is a special kind of <Route> that always
 * redirects to another route when it matches.
 */
var Redirect = React.createClass({

  displayName: 'Redirect',

  mixins: [ FakeNode ],

  propTypes: {
    path: React.PropTypes.string,
    from: React.PropTypes.string, // Alias for path.
    to: React.PropTypes.string,
    handler: PropTypes.falsy
  }

});

module.exports = Redirect;

},{"../mixins/FakeNode":26,"../utils/PropTypes":35,"react":undefined}],20:[function(require,module,exports){
var React = require('react');
var FakeNode = require('../mixins/FakeNode');

/**
 * <Route> components specify components that are rendered to the page when the
 * URL matches a given pattern.
 *
 * Routes are arranged in a nested tree structure. When a new URL is requested,
 * the tree is searched depth-first to find a route whose path matches the URL.
 * When one is found, all routes in the tree that lead to it are considered
 * "active" and their components are rendered into the DOM, nested in the same
 * order as they are in the tree.
 *
 * The preferred way to configure a router is using JSX. The XML-like syntax is
 * a great way to visualize how routes are laid out in an application.
 *
 *   var routes = [
 *     <Route handler={App}>
 *       <Route name="login" handler={Login}/>
 *       <Route name="logout" handler={Logout}/>
 *       <Route name="about" handler={About}/>
 *     </Route>
 *   ];
 *   
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 *
 * Handlers for Route components that contain children can render their active
 * child route using a <RouteHandler> element.
 *
 *   var App = React.createClass({
 *     render: function () {
 *       return (
 *         <div class="application">
 *           <RouteHandler/>
 *         </div>
 *       );
 *     }
 *   });
 */
var Route = React.createClass({

  displayName: 'Route',

  mixins: [ FakeNode ],

  propTypes: {
    name: React.PropTypes.string,
    path: React.PropTypes.string,
    handler: React.PropTypes.func.isRequired,
    ignoreScrollBehavior: React.PropTypes.bool
  }

});

module.exports = Route;

},{"../mixins/FakeNode":26,"react":undefined}],21:[function(require,module,exports){
var React = require('react');

/**
 * A <RouteHandler> component renders the active child route handler
 * when routes are nested.
 */
var RouteHandler = React.createClass({

  displayName: 'RouteHandler',

  getDefaultProps: function () {
    return {
      ref: '__routeHandler__'
    };
  },

  contextTypes: {
    getRouteAtDepth: React.PropTypes.func.isRequired,
    getRouteComponents: React.PropTypes.func.isRequired,
    routeHandlers: React.PropTypes.array.isRequired
  },

  childContextTypes: {
    routeHandlers: React.PropTypes.array.isRequired
  },

  getChildContext: function () {
    return {
      routeHandlers: this.context.routeHandlers.concat([ this ])
    };
  },

  getRouteDepth: function () {
    return this.context.routeHandlers.length - 1;
  },

  componentDidMount: function () {
    this._updateRouteComponent();
  },

  componentDidUpdate: function () {
    this._updateRouteComponent();
  },

  _updateRouteComponent: function () {
    var depth = this.getRouteDepth();
    var components = this.context.getRouteComponents();
    components[depth] = this.refs[this.props.ref];
  },

  render: function () {
    var route = this.context.getRouteAtDepth(this.getRouteDepth());
    return route ? React.createElement(route.handler, this.props) : null;
  }

});

module.exports = RouteHandler;

},{"react":undefined}],22:[function(require,module,exports){
exports.DefaultRoute = require('./components/DefaultRoute');
exports.Link = require('./components/Link');
exports.NotFoundRoute = require('./components/NotFoundRoute');
exports.Redirect = require('./components/Redirect');
exports.Route = require('./components/Route');
exports.RouteHandler = require('./components/RouteHandler');

exports.HashLocation = require('./locations/HashLocation');
exports.HistoryLocation = require('./locations/HistoryLocation');
exports.RefreshLocation = require('./locations/RefreshLocation');

exports.ImitateBrowserBehavior = require('./behaviors/ImitateBrowserBehavior');
exports.ScrollToTopBehavior = require('./behaviors/ScrollToTopBehavior');

exports.Navigation = require('./mixins/Navigation');
exports.State = require('./mixins/State');

exports.create = require('./utils/createRouter');
exports.run = require('./utils/runRouter');

},{"./behaviors/ImitateBrowserBehavior":14,"./behaviors/ScrollToTopBehavior":15,"./components/DefaultRoute":16,"./components/Link":17,"./components/NotFoundRoute":18,"./components/Redirect":19,"./components/Route":20,"./components/RouteHandler":21,"./locations/HashLocation":23,"./locations/HistoryLocation":24,"./locations/RefreshLocation":25,"./mixins/Navigation":27,"./mixins/State":30,"./utils/createRouter":38,"./utils/runRouter":42}],23:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var LocationActions = require('../actions/LocationActions');
var Path = require('../utils/Path');

/**
 * Returns the current URL path from `window.location.hash`, including query string
 */
function getHashPath() {
  invariant(
    canUseDOM,
    'getHashPath needs a DOM'
  );

  return Path.decode(
    window.location.hash.substr(1)
  );
}

var _actionType;

function ensureSlash() {
  var path = getHashPath();

  if (path.charAt(0) === '/')
    return true;

  HashLocation.replace('/' + path);

  return false;
}

var _changeListeners = [];

function notifyChange(type) {
  var change = {
    path: getHashPath(),
    type: type
  };

  _changeListeners.forEach(function (listener) {
    listener(change);
  });
}

var _isListening = false;

function onHashChange() {
  if (ensureSlash()) {
    // If we don't have an _actionType then all we know is the hash
    // changed. It was probably caused by the user clicking the Back
    // button, but may have also been the Forward button or manual
    // manipulation. So just guess 'pop'.
    notifyChange(_actionType || LocationActions.POP);
    _actionType = null;
  }
}

/**
 * A Location that uses `window.location.hash`.
 */
var HashLocation = {

  addChangeListener: function (listener) {
    _changeListeners.push(listener);

    // Do this BEFORE listening for hashchange.
    ensureSlash();

    if (_isListening)
      return;

    if (window.addEventListener) {
      window.addEventListener('hashchange', onHashChange, false);
    } else {
      window.attachEvent('onhashchange', onHashChange);
    }

    _isListening = true;
  },

  push: function (path) {
    _actionType = LocationActions.PUSH;
    window.location.hash = Path.encode(path);
  },

  replace: function (path) {
    _actionType = LocationActions.REPLACE;
    window.location.replace(window.location.pathname + '#' + Path.encode(path));
  },

  pop: function () {
    _actionType = LocationActions.POP;
    window.history.back();
  },

  getCurrentPath: getHashPath,

  toString: function () {
    return '<HashLocation>';
  }

};

module.exports = HashLocation;

},{"../actions/LocationActions":13,"../utils/Path":33,"react/lib/ExecutionEnvironment":55,"react/lib/invariant":60}],24:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var LocationActions = require('../actions/LocationActions');
var Path = require('../utils/Path');

/**
 * Returns the current URL path from `window.location`, including query string
 */
function getWindowPath() {
  invariant(
    canUseDOM,
    'getWindowPath needs a DOM'
  );

  return Path.decode(
    window.location.pathname + window.location.search
  );
}

var _changeListeners = [];

function notifyChange(type) {
  var change = {
    path: getWindowPath(),
    type: type
  };

  _changeListeners.forEach(function (listener) {
    listener(change);
  });
}

var _isListening = false;

function onPopState() {
  notifyChange(LocationActions.POP);
}

/**
 * A Location that uses HTML5 history.
 */
var HistoryLocation = {

  addChangeListener: function (listener) {
    _changeListeners.push(listener);

    if (_isListening)
      return;

    if (window.addEventListener) {
      window.addEventListener('popstate', onPopState, false);
    } else {
      window.attachEvent('popstate', onPopState);
    }

    _isListening = true;
  },

  push: function (path) {
    window.history.pushState({ path: path }, '', Path.encode(path));
    notifyChange(LocationActions.PUSH);
  },

  replace: function (path) {
    window.history.replaceState({ path: path }, '', Path.encode(path));
    notifyChange(LocationActions.REPLACE);
  },

  pop: function () {
    window.history.back();
  },

  getCurrentPath: getWindowPath,

  toString: function () {
    return '<HistoryLocation>';
  }

};

module.exports = HistoryLocation;

},{"../actions/LocationActions":13,"../utils/Path":33,"react/lib/ExecutionEnvironment":55,"react/lib/invariant":60}],25:[function(require,module,exports){
var HistoryLocation = require('./HistoryLocation');
var Path = require('../utils/Path');

/**
 * A Location that uses full page refreshes. This is used as
 * the fallback for HistoryLocation in browsers that do not
 * support the HTML5 history API.
 */
var RefreshLocation = {

  push: function (path) {
    window.location = Path.encode(path);
  },

  replace: function (path) {
    window.location.replace(Path.encode(path));
  },

  pop: function () {
    window.history.back();
  },

  getCurrentPath: HistoryLocation.getCurrentPath,

  toString: function () {
    return '<RefreshLocation>';
  }

};

module.exports = RefreshLocation;

},{"../utils/Path":33,"./HistoryLocation":24}],26:[function(require,module,exports){
var invariant = require('react/lib/invariant');

var FakeNode = {

  render: function () {
    invariant(
      false,
      '%s elements should not be rendered',
      this.constructor.displayName
    );
  }

};

module.exports = FakeNode;

},{"react/lib/invariant":60}],27:[function(require,module,exports){
var React = require('react');

/**
 * A mixin for components that modify the URL.
 *
 * Example:
 *
 *   var MyLink = React.createClass({
 *     mixins: [ Router.Navigation ],
 *     handleClick: function (event) {
 *       event.preventDefault();
 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
 *     },
 *     render: function () {
 *       return (
 *         <a onClick={this.handleClick}>Click me!</a>
 *       );
 *     }
 *   });
 */
var Navigation = {

  contextTypes: {
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired
  },

  /**
   * Returns an absolute URL path created from the given route
   * name, URL parameters, and query values.
   */
  makePath: function (to, params, query) {
    return this.context.makePath(to, params, query);
  },

  /**
   * Returns a string that may safely be used as the href of a
   * link to the route with the given name.
   */
  makeHref: function (to, params, query) {
    return this.context.makeHref(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by pushing
   * a new URL onto the history stack.
   */
  transitionTo: function (to, params, query) {
    this.context.transitionTo(to, params, query);
  },

  /**
   * Transitions to the URL specified in the arguments by replacing
   * the current URL in the history stack.
   */
  replaceWith: function (to, params, query) {
    this.context.replaceWith(to, params, query);
  },

  /**
   * Transitions to the previous URL.
   */
  goBack: function () {
    this.context.goBack();
  }

};

module.exports = Navigation;

},{"react":undefined}],28:[function(require,module,exports){
var React = require('react');

/**
 * Provides the router with context for Router.Navigation.
 */
var NavigationContext = {

  childContextTypes: {
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired
  },

  getChildContext: function () {
    return {
      makePath: this.constructor.makePath,
      makeHref: this.constructor.makeHref,
      transitionTo: this.constructor.transitionTo,
      replaceWith: this.constructor.replaceWith,
      goBack: this.constructor.goBack
    };
  }

};

module.exports = NavigationContext;

},{"react":undefined}],29:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var getWindowScrollPosition = require('../utils/getWindowScrollPosition');

function shouldUpdateScroll(state, prevState) {
  if (!prevState)
    return true;

  // Don't update scroll position when only the query has changed.
  if (state.pathname === prevState.pathname)
    return false;

  var routes = state.routes;
  var prevRoutes = prevState.routes;

  var sharedAncestorRoutes = routes.filter(function (route) {
    return prevRoutes.indexOf(route) !== -1;
  });

  return !sharedAncestorRoutes.some(function (route) {
    return route.ignoreScrollBehavior;
  });
}

/**
 * Provides the router with the ability to manage window scroll position
 * according to its scroll behavior.
 */
var Scrolling = {

  statics: {
    /**
     * Records curent scroll position as the last known position for the given URL path.
     */
    recordScrollPosition: function (path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};

      this.scrollHistory[path] = getWindowScrollPosition();
    },

    /**
     * Returns the last known scroll position for the given URL path.
     */
    getScrollPosition: function (path) {
      if (!this.scrollHistory)
        this.scrollHistory = {};

      return this.scrollHistory[path] || null;
    }
  },

  componentWillMount: function () {
    invariant(
      this.getScrollBehavior() == null || canUseDOM,
      'Cannot use scroll behavior without a DOM'
    );
  },

  componentDidMount: function () {
    this._updateScroll();
  },

  componentDidUpdate: function (prevProps, prevState) {
    this._updateScroll(prevState);
  },

  _updateScroll: function (prevState) {
    if (!shouldUpdateScroll(this.state, prevState))
      return;

    var scrollBehavior = this.getScrollBehavior();

    if (scrollBehavior)
      scrollBehavior.updateScrollPosition(
        this.constructor.getScrollPosition(this.state.path),
        this.state.action
      );
  }

};

module.exports = Scrolling;

},{"../utils/getWindowScrollPosition":40,"react/lib/ExecutionEnvironment":55,"react/lib/invariant":60}],30:[function(require,module,exports){
var React = require('react');

/**
 * A mixin for components that need to know the path, routes, URL
 * params and query that are currently active.
 *
 * Example:
 *
 *   var AboutLink = React.createClass({
 *     mixins: [ Router.State ],
 *     render: function () {
 *       var className = this.props.className;
 *   
 *       if (this.isActive('about'))
 *         className += ' is-active';
 *   
 *       return React.DOM.a({ className: className }, this.props.children);
 *     }
 *   });
 */
var State = {

  contextTypes: {
    getCurrentPath: React.PropTypes.func.isRequired,
    getCurrentRoutes: React.PropTypes.func.isRequired,
    getCurrentPathname: React.PropTypes.func.isRequired,
    getCurrentParams: React.PropTypes.func.isRequired,
    getCurrentQuery: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.func.isRequired
  },

  /**
   * Returns the current URL path.
   */
  getPath: function () {
    return this.context.getCurrentPath();
  },

  /**
   * Returns an array of the routes that are currently active.
   */
  getRoutes: function () {
    return this.context.getCurrentRoutes();
  },

  /**
   * Returns the current URL path without the query string.
   */
  getPathname: function () {
    return this.context.getCurrentPathname();
  },

  /**
   * Returns an object of the URL params that are currently active.
   */
  getParams: function () {
    return this.context.getCurrentParams();
  },

  /**
   * Returns an object of the query params that are currently active.
   */
  getQuery: function () {
    return this.context.getCurrentQuery();
  },

  /**
   * A helper method to determine if a given route, params, and query
   * are active.
   */
  isActive: function (to, params, query) {
    return this.context.isActive(to, params, query);
  }

};

module.exports = State;

},{"react":undefined}],31:[function(require,module,exports){
var React = require('react');
var assign = require('react/lib/Object.assign');
var Path = require('../utils/Path');

function routeIsActive(activeRoutes, routeName) {
  return activeRoutes.some(function (route) {
    return route.name === routeName;
  });
}

function paramsAreActive(activeParams, params) {
  for (var property in params)
    if (String(activeParams[property]) !== String(params[property]))
      return false;

  return true;
}

function queryIsActive(activeQuery, query) {
  for (var property in query)
    if (String(activeQuery[property]) !== String(query[property]))
      return false;

  return true;
}

/**
 * Provides the router with context for Router.State.
 */
var StateContext = {

  /**
   * Returns the current URL path + query string.
   */
  getCurrentPath: function () {
    return this.state.path;
  },

  /**
   * Returns a read-only array of the currently active routes.
   */
  getCurrentRoutes: function () {
    return this.state.routes.slice(0);
  },

  /**
   * Returns the current URL path without the query string.
   */
  getCurrentPathname: function () {
    return this.state.pathname;
  },

  /**
   * Returns a read-only object of the currently active URL parameters.
   */
  getCurrentParams: function () {
    return assign({}, this.state.params);
  },

  /**
   * Returns a read-only object of the currently active query parameters.
   */
  getCurrentQuery: function () {
    return assign({}, this.state.query);
  },

  /**
   * Returns true if the given route, params, and query are active.
   */
  isActive: function (to, params, query) {
    if (Path.isAbsolute(to))
      return to === this.state.path;

    return routeIsActive(this.state.routes, to) &&
      paramsAreActive(this.state.params, params) &&
      (query == null || queryIsActive(this.state.query, query));
  },

  childContextTypes: {
    getCurrentPath: React.PropTypes.func.isRequired,
    getCurrentRoutes: React.PropTypes.func.isRequired,
    getCurrentPathname: React.PropTypes.func.isRequired,
    getCurrentParams: React.PropTypes.func.isRequired,
    getCurrentQuery: React.PropTypes.func.isRequired,
    isActive: React.PropTypes.func.isRequired
  },

  getChildContext: function () {
    return {
      getCurrentPath: this.getCurrentPath,
      getCurrentRoutes: this.getCurrentRoutes,
      getCurrentPathname: this.getCurrentPathname,
      getCurrentParams: this.getCurrentParams,
      getCurrentQuery: this.getCurrentQuery,
      isActive: this.isActive
    };
  }

};

module.exports = StateContext;

},{"../utils/Path":33,"react":undefined,"react/lib/Object.assign":56}],32:[function(require,module,exports){
/**
 * Represents a cancellation caused by navigating away
 * before the previous transition has fully resolved.
 */
function Cancellation() { }

module.exports = Cancellation;

},{}],33:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var merge = require('qs/lib/utils').merge;
var qs = require('qs');

var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;
var paramInjectTrailingSlashMatcher = /\/\/\?|\/\?/g;
var queryMatcher = /\?(.+)/;

var _compiledPatterns = {};

function compilePattern(pattern) {
  if (!(pattern in _compiledPatterns)) {
    var paramNames = [];
    var source = pattern.replace(paramCompileMatcher, function (match, paramName) {
      if (paramName) {
        paramNames.push(paramName);
        return '([^/?#]+)';
      } else if (match === '*') {
        paramNames.push('splat');
        return '(.*?)';
      } else {
        return '\\' + match;
      }
    });

    _compiledPatterns[pattern] = {
      matcher: new RegExp('^' + source + '$', 'i'),
      paramNames: paramNames
    };
  }

  return _compiledPatterns[pattern];
}

var Path = {

  /**
   * Safely decodes special characters in the given URL path.
   */
  decode: function (path) {
    return decodeURI(path.replace(/\+/g, ' '));
  },

  /**
   * Safely encodes special characters in the given URL path.
   */
  encode: function (path) {
    return encodeURI(path).replace(/%20/g, '+');
  },

  /**
   * Returns an array of the names of all parameters in the given pattern.
   */
  extractParamNames: function (pattern) {
    return compilePattern(pattern).paramNames;
  },

  /**
   * Extracts the portions of the given URL path that match the given pattern
   * and returns an object of param name => value pairs. Returns null if the
   * pattern does not match the given path.
   */
  extractParams: function (pattern, path) {
    var object = compilePattern(pattern);
    var match = path.match(object.matcher);

    if (!match)
      return null;

    var params = {};

    object.paramNames.forEach(function (paramName, index) {
      params[paramName] = match[index + 1];
    });

    return params;
  },

  /**
   * Returns a version of the given route path with params interpolated. Throws
   * if there is a dynamic segment of the route path for which there is no param.
   */
  injectParams: function (pattern, params) {
    params = params || {};

    var splatIndex = 0;

    return pattern.replace(paramInjectMatcher, function (match, paramName) {
      paramName = paramName || 'splat';

      // If param is optional don't check for existence
      if (paramName.slice(-1) !== '?') {
        invariant(
          params[paramName] != null,
          'Missing "' + paramName + '" parameter for path "' + pattern + '"'
        );
      } else {
        paramName = paramName.slice(0, -1);

        if (params[paramName] == null)
          return '';
      }

      var segment;
      if (paramName === 'splat' && Array.isArray(params[paramName])) {
        segment = params[paramName][splatIndex++];

        invariant(
          segment != null,
          'Missing splat # ' + splatIndex + ' for path "' + pattern + '"'
        );
      } else {
        segment = params[paramName];
      }

      return segment;
    }).replace(paramInjectTrailingSlashMatcher, '/');
  },

  /**
   * Returns an object that is the result of parsing any query string contained
   * in the given path, null if the path contains no query string.
   */
  extractQuery: function (path) {
    var match = path.match(queryMatcher);
    return match && qs.parse(match[1]);
  },

  /**
   * Returns a version of the given path without the query string.
   */
  withoutQuery: function (path) {
    return path.replace(queryMatcher, '');
  },

  /**
   * Returns a version of the given path with the parameters in the given
   * query merged into the query string.
   */
  withQuery: function (path, query) {
    var existingQuery = Path.extractQuery(path);

    if (existingQuery)
      query = query ? merge(existingQuery, query) : existingQuery;

    var queryString = query && qs.stringify(query);

    if (queryString)
      return Path.withoutQuery(path) + '?' + queryString;

    return path;
  },

  /**
   * Returns true if the given path is absolute.
   */
  isAbsolute: function (path) {
    return path.charAt(0) === '/';
  },

  /**
   * Returns a normalized version of the given path.
   */
  normalize: function (path, parentRoute) {
    return path.replace(/^\/*/, '/');
  },

  /**
   * Joins two URL paths together.
   */
  join: function (a, b) {
    return a.replace(/\/*$/, '/') + b;
  }

};

module.exports = Path;

},{"qs":44,"qs/lib/utils":48,"react/lib/invariant":60}],34:[function(require,module,exports){
var Promise = require('when/lib/Promise');

// TODO: Use process.env.NODE_ENV check + envify to enable
// when's promise monitor here when in dev.

module.exports = Promise;

},{"when/lib/Promise":49}],35:[function(require,module,exports){
var PropTypes = {

  /**
   * Requires that the value of a prop be falsy.
   */
  falsy: function (props, propName, elementName) {
    if (props[propName])
      return new Error('<' + elementName + '> may not have a "' + propName + '" prop');
  }

};

module.exports = PropTypes;

},{}],36:[function(require,module,exports){
/**
 * Encapsulates a redirect to the given route.
 */
function Redirect(to, params, query) {
  this.to = to;
  this.params = params;
  this.query = query;
}

module.exports = Redirect;

},{}],37:[function(require,module,exports){
var assign = require('react/lib/Object.assign');
var reversedArray = require('./reversedArray');
var Redirect = require('./Redirect');
var Promise = require('./Promise');

/**
 * Runs all hook functions serially and calls callback(error) when finished.
 * A hook may return a promise if it needs to execute asynchronously.
 */
function runHooks(hooks, callback) {
  try {
    var promise = hooks.reduce(function (promise, hook) {
      // The first hook to use transition.wait makes the rest
      // of the transition async from that point forward.
      return promise ? promise.then(hook) : hook();
    }, null);
  } catch (error) {
    return callback(error); // Sync error.
  }

  if (promise) {
    // Use setTimeout to break the promise chain.
    promise.then(function () {
      setTimeout(callback);
    }, function (error) {
      setTimeout(function () {
        callback(error);
      });
    });
  } else {
    callback();
  }
}

/**
 * Calls the willTransitionFrom hook of all handlers in the given matches
 * serially in reverse with the transition object and the current instance of
 * the route's handler, so that the deepest nested handlers are called first.
 * Calls callback(error) when finished.
 */
function runTransitionFromHooks(transition, routes, components, callback) {
  components = reversedArray(components);

  var hooks = reversedArray(routes).map(function (route, index) {
    return function () {
      var handler = route.handler;

      if (!transition.isAborted && handler.willTransitionFrom)
        return handler.willTransitionFrom(transition, components[index]);

      var promise = transition._promise;
      transition._promise = null;

      return promise;
    };
  });

  runHooks(hooks, callback);
}

/**
 * Calls the willTransitionTo hook of all handlers in the given matches
 * serially with the transition object and any params that apply to that
 * handler. Calls callback(error) when finished.
 */
function runTransitionToHooks(transition, routes, params, query, callback) {
  var hooks = routes.map(function (route) {
    return function () {
      var handler = route.handler;

      if (!transition.isAborted && handler.willTransitionTo)
        handler.willTransitionTo(transition, params, query);

      var promise = transition._promise;
      transition._promise = null;

      return promise;
    };
  });

  runHooks(hooks, callback);
}

/**
 * Encapsulates a transition to a given path.
 *
 * The willTransitionTo and willTransitionFrom handlers receive
 * an instance of this class as their first argument.
 */
function Transition(path, retry) {
  this.path = path;
  this.abortReason = null;
  this.isAborted = false;
  this.retry = retry.bind(this);
  this._promise = null;
}

assign(Transition.prototype, {

  abort: function (reason) {
    if (this.isAborted) {
      // First abort wins.
      return;
    }

    this.abortReason = reason;
    this.isAborted = true;
  },

  redirect: function (to, params, query) {
    this.abort(new Redirect(to, params, query));
  },

  wait: function (value) {
    this._promise = Promise.resolve(value);
  },

  from: function (routes, components, callback) {
    return runTransitionFromHooks(this, routes, components, callback);
  },

  to: function (routes, params, query, callback) {
    return runTransitionToHooks(this, routes, params, query, callback);
  }

});

module.exports = Transition;

},{"./Promise":34,"./Redirect":36,"./reversedArray":41,"react/lib/Object.assign":56}],38:[function(require,module,exports){
(function (process){
var React = require('react');
var warning = require('react/lib/warning');
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;
var ImitateBrowserBehavior = require('../behaviors/ImitateBrowserBehavior');
var RouteHandler = require('../components/RouteHandler');
var LocationActions = require('../actions/LocationActions');
var HashLocation = require('../locations/HashLocation');
var HistoryLocation = require('../locations/HistoryLocation');
var RefreshLocation = require('../locations/RefreshLocation');
var NavigationContext = require('../mixins/NavigationContext');
var StateContext = require('../mixins/StateContext');
var Scrolling = require('../mixins/Scrolling');
var createRoutesFromChildren = require('./createRoutesFromChildren');
var supportsHistory = require('./supportsHistory');
var Transition = require('./Transition');
var PropTypes = require('./PropTypes');
var Redirect = require('./Redirect');
var Cancellation = require('./Cancellation');
var Path = require('./Path');

/**
 * The default location for new routers.
 */
var DEFAULT_LOCATION = canUseDOM ? HashLocation : '/';

/**
 * The default scroll behavior for new routers.
 */
var DEFAULT_SCROLL_BEHAVIOR = canUseDOM ? ImitateBrowserBehavior : null;

/**
 * The default error handler for new routers.
 */
function defaultErrorHandler(error) {
  // Throw so we don't silently swallow async errors.
  throw error; // This error probably originated in a transition hook.
}

/**
 * The default aborted transition handler for new routers.
 */
function defaultAbortHandler(abortReason, location) {
  if (typeof location === 'string')
    throw new Error('Unhandled aborted transition! Reason: ' + abortReason);

  if (abortReason instanceof Cancellation) {
    return;
  } else if (abortReason instanceof Redirect) {
    location.replace(this.makePath(abortReason.to, abortReason.params, abortReason.query));
  } else {
    location.pop();
  }
}

function findMatch(pathname, routes, defaultRoute, notFoundRoute) {
  var match, route, params;

  for (var i = 0, len = routes.length; i < len; ++i) {
    route = routes[i];

    // Check the subtree first to find the most deeply-nested match.
    match = findMatch(pathname, route.childRoutes, route.defaultRoute, route.notFoundRoute);

    if (match != null) {
      match.routes.unshift(route);
      return match;
    }

    // No routes in the subtree matched, so check this route.
    params = Path.extractParams(route.path, pathname);

    if (params)
      return createMatch(route, params);
  }

  // No routes matched, so try the default route if there is one.
  if (defaultRoute && (params = Path.extractParams(defaultRoute.path, pathname)))
    return createMatch(defaultRoute, params);

  // Last attempt: does the "not found" route match?
  if (notFoundRoute && (params = Path.extractParams(notFoundRoute.path, pathname)))
    return createMatch(notFoundRoute, params);

  return match;
}

function createMatch(route, params) {
  return { routes: [ route ], params: params };
}

function hasMatch(routes, route, prevParams, nextParams) {
  return routes.some(function (r) {
    if (r !== route)
      return false;

    var paramNames = route.paramNames;
    var paramName;

    for (var i = 0, len = paramNames.length; i < len; ++i) {
      paramName = paramNames[i];

      if (nextParams[paramName] !== prevParams[paramName])
        return false;
    }

    return true;
  });
}

/**
 * Creates and returns a new router using the given options. A router
 * is a ReactComponent class that knows how to react to changes in the
 * URL and keep the contents of the page in sync.
 *
 * Options may be any of the following:
 *
 * - routes           (required) The route config
 * - location         The location to use. Defaults to HashLocation when
 *                    the DOM is available, "/" otherwise
 * - scrollBehavior   The scroll behavior to use. Defaults to ImitateBrowserBehavior
 *                    when the DOM is available, null otherwise
 * - onError          A function that is used to handle errors
 * - onAbort          A function that is used to handle aborted transitions
 *
 * When rendering in a server-side environment, the location should simply
 * be the URL path that was used in the request, including the query string.
 */
function createRouter(options) {
  options = options || {};

  if (typeof options === 'function') {
    options = { routes: options }; // Router.create(<Route>)
  } else if (Array.isArray(options)) {
    options = { routes: options }; // Router.create([ <Route>, <Route> ])
  }

  var routes = [];
  var namedRoutes = {};
  var components = [];
  var location = options.location || DEFAULT_LOCATION;
  var scrollBehavior = options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;
  var onError = options.onError || defaultErrorHandler;
  var onAbort = options.onAbort || defaultAbortHandler;
  var state = {};
  var nextState = {};
  var pendingTransition = null;

  function updateState() {
    state = nextState;
    nextState = {};
  }

  // Automatically fall back to full page refreshes in
  // browsers that don't support the HTML history API.
  if (location === HistoryLocation && !supportsHistory())
    location = RefreshLocation;

  var router = React.createClass({

    displayName: 'Router',

    mixins: [ NavigationContext, StateContext, Scrolling ],

    statics: {

      defaultRoute: null,
      notFoundRoute: null,

      /**
       * Adds routes to this router from the given children object (see ReactChildren).
       */
      addRoutes: function (children) {
        routes.push.apply(routes, createRoutesFromChildren(children, this, namedRoutes));
      },

      /**
       * Returns an absolute URL path created from the given route
       * name, URL parameters, and query.
       */
      makePath: function (to, params, query) {
        var path;
        if (Path.isAbsolute(to)) {
          path = Path.normalize(to);
        } else {
          var route = namedRoutes[to];

          invariant(
            route,
            'Unable to find <Route name="%s">',
            to
          );

          path = route.path;
        }

        return Path.withQuery(Path.injectParams(path, params), query);
      },

      /**
       * Returns a string that may safely be used as the href of a link
       * to the route with the given name, URL parameters, and query.
       */
      makeHref: function (to, params, query) {
        var path = this.makePath(to, params, query);
        return (location === HashLocation) ? '#' + path : path;
      },

      /**
       * Transitions to the URL specified in the arguments by pushing
       * a new URL onto the history stack.
       */
      transitionTo: function (to, params, query) {
        invariant(
          typeof location !== 'string',
          'You cannot use transitionTo with a static location'
        );

        var path = this.makePath(to, params, query);

        if (pendingTransition) {
          // Replace so pending location does not stay in history.
          location.replace(path);
        } else {
          location.push(path);
        }
      },

      /**
       * Transitions to the URL specified in the arguments by replacing
       * the current URL in the history stack.
       */
      replaceWith: function (to, params, query) {
        invariant(
          typeof location !== 'string',
          'You cannot use replaceWith with a static location'
        );

        location.replace(this.makePath(to, params, query));
      },

      /**
       * Transitions to the previous URL.
       */
      goBack: function () {
        invariant(
          typeof location !== 'string',
          'You cannot use goBack with a static location'
        );

        location.pop();
      },

      /**
       * Performs a match of the given pathname against this router and returns an object
       * with the { routes, params } that match. Returns null if no match can be made.
       */
      match: function (pathname) {
        return findMatch(pathname, routes, this.defaultRoute, this.notFoundRoute) || null;
      },

      /**
       * Performs a transition to the given path and calls callback(error, abortReason)
       * when the transition is finished. If both arguments are null the router's state
       * was updated. Otherwise the transition did not complete.
       *
       * In a transition, a router first determines which routes are involved by beginning
       * with the current route, up the route tree to the first parent route that is shared
       * with the destination route, and back down the tree to the destination route. The
       * willTransitionFrom hook is invoked on all route handlers we're transitioning away
       * from, in reverse nesting order. Likewise, the willTransitionTo hook is invoked on
       * all route handlers we're transitioning to.
       *
       * Both willTransitionFrom and willTransitionTo hooks may either abort or redirect the
       * transition. To resolve asynchronously, they may use transition.wait(promise). If no
       * hooks wait, the transition is fully synchronous.
       */
      dispatch: function (path, action, callback) {
        if (pendingTransition) {
          pendingTransition.abort(new Cancellation);
          pendingTransition = null;
        }

        var prevPath = state.path;
        if (prevPath === path)
          return; // Nothing to do!

        // Record the scroll position as early as possible to
        // get it before browsers try update it automatically.
        if (prevPath && action !== LocationActions.REPLACE)
          this.recordScrollPosition(prevPath);

        var pathname = Path.withoutQuery(path);
        var match = this.match(pathname);

        warning(
          match != null,
          'No route matches path "%s". Make sure you have <Route path="%s"> somewhere in your routes',
          path, path
        );

        if (match == null)
          match = {};

        var prevRoutes = state.routes || [];
        var prevParams = state.params || {};

        var nextRoutes = match.routes || [];
        var nextParams = match.params || {};
        var nextQuery = Path.extractQuery(path) || {};

        var fromRoutes, toRoutes;
        if (prevRoutes.length) {
          fromRoutes = prevRoutes.filter(function (route) {
            return !hasMatch(nextRoutes, route, prevParams, nextParams);
          });

          toRoutes = nextRoutes.filter(function (route) {
            return !hasMatch(prevRoutes, route, prevParams, nextParams);
          });
        } else {
          fromRoutes = [];
          toRoutes = nextRoutes;
        }

        var transition = new Transition(path, this.replaceWith.bind(this, path));
        pendingTransition = transition;

        transition.from(fromRoutes, components, function (error) {
          if (error || transition.isAborted)
            return callback.call(router, error, transition);

          transition.to(toRoutes, nextParams, nextQuery, function (error) {
            if (error || transition.isAborted)
              return callback.call(router, error, transition);

            nextState.path = path;
            nextState.action = action;
            nextState.pathname = pathname;
            nextState.routes = nextRoutes;
            nextState.params = nextParams;
            nextState.query = nextQuery;

            callback.call(router, null, transition);
          });
        });
      },

      /**
       * Starts this router and calls callback(router, state) when the route changes.
       *
       * If the router's location is static (i.e. a URL path in a server environment)
       * the callback is called only once. Otherwise, the location should be one of the
       * Router.*Location objects (e.g. Router.HashLocation or Router.HistoryLocation).
       */
      run: function (callback) {
        function dispatchHandler(error, transition) {
          pendingTransition = null;

          if (error) {
            onError.call(router, error);
          } else if (transition.isAborted) {
            onAbort.call(router, transition.abortReason, location);
          } else {
            callback.call(router, router, nextState);
          }
        }

        if (typeof location === 'string') {
          warning(
            !canUseDOM || process.env.NODE_ENV === 'test',
            'You should not use a static location in a DOM environment because ' +
            'the router will not be kept in sync with the current URL'
          );

          // Dispatch the location.
          router.dispatch(location, null, dispatchHandler);
        } else {
          invariant(
            canUseDOM,
            'You cannot use %s in a non-DOM environment',
            location
          );

          // Listen for changes to the location.
          function changeListener(change) {
            router.dispatch(change.path, change.type, dispatchHandler);
          }

          if (location.addChangeListener)
            location.addChangeListener(changeListener);

          // Bootstrap using the current path.
          router.dispatch(location.getCurrentPath(), null, dispatchHandler);
        }
      }

    },

    propTypes: {
      children: PropTypes.falsy
    },

    getLocation: function () {
      return location;
    },

    getScrollBehavior: function () {
      return scrollBehavior;
    },

    getRouteAtDepth: function (depth) {
      var routes = this.state.routes;
      return routes && routes[depth];
    },

    getRouteComponents: function () {
      return components;
    },

    getInitialState: function () {
      updateState();
      return state;
    },

    componentWillReceiveProps: function () {
      updateState();
      this.setState(state);
    },

    render: function () {
      return this.getRouteAtDepth(0) ? React.createElement(RouteHandler, this.props) : null;
    },

    childContextTypes: {
      getRouteAtDepth: React.PropTypes.func.isRequired,
      getRouteComponents: React.PropTypes.func.isRequired,
      routeHandlers: React.PropTypes.array.isRequired
    },

    getChildContext: function () {
      return {
        getRouteComponents: this.getRouteComponents,
        getRouteAtDepth: this.getRouteAtDepth,
        routeHandlers: [ this ]
      };
    }

  });

  if (options.routes)
    router.addRoutes(options.routes);

  return router;
}

module.exports = createRouter;

}).call(this,require('_process'))
},{"../actions/LocationActions":13,"../behaviors/ImitateBrowserBehavior":14,"../components/RouteHandler":21,"../locations/HashLocation":23,"../locations/HistoryLocation":24,"../locations/RefreshLocation":25,"../mixins/NavigationContext":28,"../mixins/Scrolling":29,"../mixins/StateContext":31,"./Cancellation":32,"./Path":33,"./PropTypes":35,"./Redirect":36,"./Transition":37,"./createRoutesFromChildren":39,"./supportsHistory":43,"_process":12,"react":undefined,"react/lib/ExecutionEnvironment":55,"react/lib/invariant":60,"react/lib/warning":61}],39:[function(require,module,exports){
var React = require('react');
var warning = require('react/lib/warning');
var invariant = require('react/lib/invariant');
var DefaultRoute = require('../components/DefaultRoute');
var NotFoundRoute = require('../components/NotFoundRoute');
var Redirect = require('../components/Redirect');
var Route = require('../components/Route');
var Path = require('./Path');

var CONFIG_ELEMENT_TYPES = [
  DefaultRoute.type,
  NotFoundRoute.type,
  Redirect.type,
  Route.type
];

function createRedirectHandler(to, _params, _query) {
  return React.createClass({
    statics: {
      willTransitionTo: function (transition, params, query) {
        transition.redirect(to, _params || params, _query || query);
      }
    },

    render: function () {
      return null;
    }
  });
}

function checkPropTypes(componentName, propTypes, props) {
  for (var propName in propTypes) {
    if (propTypes.hasOwnProperty(propName)) {
      var error = propTypes[propName](props, propName, componentName);

      if (error instanceof Error)
        warning(false, error.message);
    }
  }
}

function createRoute(element, parentRoute, namedRoutes) {
  var type = element.type;
  var props = element.props;
  var componentName = (type && type.displayName) || 'UnknownComponent';

  invariant(
    CONFIG_ELEMENT_TYPES.indexOf(type) !== -1,
    'Unrecognized route configuration element "<%s>"',
    componentName
  );

  if (type.propTypes)
    checkPropTypes(componentName, type.propTypes, props);

  var route = { name: props.name };

  if (props.ignoreScrollBehavior) {
    route.ignoreScrollBehavior = true;
  }

  if (type === Redirect.type) {
    route.handler = createRedirectHandler(props.to, props.params, props.query);
    props.path = props.path || props.from || '*';
  } else {
    route.handler = props.handler;
  }

  var parentPath = (parentRoute && parentRoute.path) || '/';

  if ((props.path || props.name) && type !== DefaultRoute.type && type !== NotFoundRoute.type) {
    var path = props.path || props.name;

    // Relative paths extend their parent.
    if (!Path.isAbsolute(path))
      path = Path.join(parentPath, path);

    route.path = Path.normalize(path);
  } else {
    route.path = parentPath;

    if (type === NotFoundRoute.type)
      route.path += '*';
  }

  route.paramNames = Path.extractParamNames(route.path);

  // Make sure the route's path has all params its parent needs.
  if (parentRoute && Array.isArray(parentRoute.paramNames)) {
    parentRoute.paramNames.forEach(function (paramName) {
      invariant(
        route.paramNames.indexOf(paramName) !== -1,
        'The nested route path "%s" is missing the "%s" parameter of its parent path "%s"',
        route.path, paramName, parentRoute.path
      );
    });
  }

  // Make sure the route can be looked up by <Link>s.
  if (props.name) {
    invariant(
      namedRoutes[props.name] == null,
      'You cannot use the name "%s" for more than one route',
      props.name
    );

    namedRoutes[props.name] = route;
  }

  // Handle <NotFoundRoute>.
  if (type === NotFoundRoute.type) {
    invariant(
      parentRoute,
      '<NotFoundRoute> must have a parent <Route>'
    );

    invariant(
      parentRoute.notFoundRoute == null,
      'You may not have more than one <NotFoundRoute> per <Route>'
    );

    parentRoute.notFoundRoute = route;

    return null;
  }

  // Handle <DefaultRoute>.
  if (type === DefaultRoute.type) {
    invariant(
      parentRoute,
      '<DefaultRoute> must have a parent <Route>'
    );

    invariant(
      parentRoute.defaultRoute == null,
      'You may not have more than one <DefaultRoute> per <Route>'
    );

    parentRoute.defaultRoute = route;

    return null;
  }

  route.childRoutes = createRoutesFromChildren(props.children, route, namedRoutes);

  return route;
}

/**
 * Creates and returns an array of route objects from the given ReactChildren.
 */
function createRoutesFromChildren(children, parentRoute, namedRoutes) {
  var routes = [];

  React.Children.forEach(children, function (child) {
    // Exclude <DefaultRoute>s and <NotFoundRoute>s.
    if (child = createRoute(child, parentRoute, namedRoutes))
      routes.push(child);
  });

  return routes;
}

module.exports = createRoutesFromChildren;

},{"../components/DefaultRoute":16,"../components/NotFoundRoute":18,"../components/Redirect":19,"../components/Route":20,"./Path":33,"react":undefined,"react/lib/invariant":60,"react/lib/warning":61}],40:[function(require,module,exports){
var invariant = require('react/lib/invariant');
var canUseDOM = require('react/lib/ExecutionEnvironment').canUseDOM;

/**
 * Returns the current scroll position of the window as { x, y }.
 */
function getWindowScrollPosition() {
  invariant(
    canUseDOM,
    'Cannot get current scroll position without a DOM'
  );

  return {
    x: window.scrollX,
    y: window.scrollY
  };
}

module.exports = getWindowScrollPosition;

},{"react/lib/ExecutionEnvironment":55,"react/lib/invariant":60}],41:[function(require,module,exports){
function reversedArray(array) {
  return array.slice(0).reverse();
}

module.exports = reversedArray;

},{}],42:[function(require,module,exports){
var createRouter = require('./createRouter');

/**
 * A high-level convenience method that creates, configures, and
 * runs a router in one shot. The method signature is:
 *
 *   Router.run(routes[, location ], callback);
 *
 * Using `window.location.hash` to manage the URL, you could do:
 *
 *   Router.run(routes, function (Handler) {
 *     React.render(<Handler/>, document.body);
 *   });
 * 
 * Using HTML5 history and a custom "cursor" prop:
 * 
 *   Router.run(routes, Router.HistoryLocation, function (Handler) {
 *     React.render(<Handler cursor={cursor}/>, document.body);
 *   });
 *
 * Returns the newly created router.
 *
 * Note: If you need to specify further options for your router such
 * as error/abort handling or custom scroll behavior, use Router.create
 * instead.
 *
 *   var router = Router.create(options);
 *   router.run(function (Handler) {
 *     // ...
 *   });
 */
function runRouter(routes, location, callback) {
  if (typeof location === 'function') {
    callback = location;
    location = null;
  }

  var router = createRouter({
    routes: routes,
    location: location
  });

  router.run(callback);

  return router;
}

module.exports = runRouter;

},{"./createRouter":38}],43:[function(require,module,exports){
function supportsHistory() {
  /*! taken from modernizr
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   */
  var ua = navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 ||
      (ua.indexOf('Android 4.0') !== -1)) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1) {
    return false;
  }
  return (window.history && 'pushState' in window.history);
}

module.exports = supportsHistory;

},{}],44:[function(require,module,exports){
module.exports = require('./lib');

},{"./lib":45}],45:[function(require,module,exports){
// Load modules

var Stringify = require('./stringify');
var Parse = require('./parse');


// Declare internals

var internals = {};


module.exports = {
    stringify: Stringify,
    parse: Parse
};

},{"./parse":46,"./stringify":47}],46:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&',
    depth: 5,
    arrayLimit: 20,
    parameterLimit: 1000
};


internals.parseValues = function (str, options) {

    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0, il = parts.length; i < il; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (!obj[key]) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat(obj[key]).concat(val);
            }
        }
    }

    return obj;
};


internals.parseObject = function (chain, val, options) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj = {};
    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val, options));
    }
    else {
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (!isNaN(index) &&
            root !== cleanRoot &&
            index <= options.arrayLimit) {

            obj = [];
            obj[index] = internals.parseObject(chain, val, options);
        }
        else {
            obj[cleanRoot] = internals.parseObject(chain, val, options);
        }
    }

    return obj;
};


internals.parseKeys = function (key, val, options) {

    if (!key) {
        return;
    }

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Don't allow them to overwrite object prototype properties

    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {

        ++i;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val, options);
};


module.exports = function (str, options) {

    if (str === '' ||
        str === null ||
        typeof str === 'undefined') {

        return {};
    }

    options = options || {};
    options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter) ? options.delimiter : internals.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : internals.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : internals.arrayLimit;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : internals.parameterLimit;

    var tempObj = typeof str === 'string' ? internals.parseValues(str, options) : str;
    var obj = {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var newObj = internals.parseKeys(key, tempObj[key], options);
        obj = Utils.merge(obj, newObj);
    }

    return Utils.compact(obj);
};

},{"./utils":48}],47:[function(require,module,exports){
// Load modules

var Utils = require('./utils');


// Declare internals

var internals = {
    delimiter: '&'
};


internals.stringify = function (obj, prefix) {

    if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];
    }

    var values = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']'));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;

    var keys = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys = keys.concat(internals.stringify(obj[key], key));
        }
    }

    return keys.join(delimiter);
};

},{"./utils":48}],48:[function(require,module,exports){
(function (Buffer){
// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (typeof source[i] !== 'undefined') {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    if (Array.isArray(source)) {
        for (var i = 0, il = source.length; i < il; ++i) {
            if (typeof source[i] !== 'undefined') {
                if (typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], source[i]);
                }
                else {
                    target[i] = source[i];
                }
            }
        }

        return target;
    }

    if (Array.isArray(target)) {
        if (typeof source !== 'object') {
            target.push(source);
            return target;
        }
        else {
            target = exports.arrayToObject(target);
        }
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (value &&
            typeof value === 'object') {

            if (!target[key]) {
                target[key] = value;
            }
            else {
                target[key] = exports.merge(target[key], value);
            }
        }
        else {
            target[key] = value;
        }
    }

    return target;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj, refs) {

    if (typeof obj !== 'object' ||
        obj === null) {

        return obj;
    }

    refs = refs || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0, l = obj.length; i < l; ++i) {
            if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        obj[key] = exports.compact(obj[key], refs);
    }

    return obj;
};


exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};


exports.isBuffer = function (obj) {

    if (typeof Buffer !== 'undefined') {
        return Buffer.isBuffer(obj);
    }
    else {
        return false;
    }
};

}).call(this,require("buffer").Buffer)
},{"buffer":8}],49:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./async');

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":51,"./async":52,"./makePromise":53}],50:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {
	/**
	 * Circular queue
	 * @param {number} capacityPow2 power of 2 to which this queue's capacity
	 *  will be set initially. eg when capacityPow2 == 3, queue capacity
	 *  will be 8.
	 * @constructor
	 */
	function Queue(capacityPow2) {
		this.head = this.tail = this.length = 0;
		this.buffer = new Array(1 << capacityPow2);
	}

	Queue.prototype.push = function(x) {
		if(this.length === this.buffer.length) {
			this._ensureCapacity(this.length * 2);
		}

		this.buffer[this.tail] = x;
		this.tail = (this.tail + 1) & (this.buffer.length - 1);
		++this.length;
		return this.length;
	};

	Queue.prototype.shift = function() {
		var x = this.buffer[this.head];
		this.buffer[this.head] = void 0;
		this.head = (this.head + 1) & (this.buffer.length - 1);
		--this.length;
		return x;
	};

	Queue.prototype._ensureCapacity = function(capacity) {
		var head = this.head;
		var buffer = this.buffer;
		var newBuffer = new Array(capacity);
		var i = 0;
		var len;

		if(head === 0) {
			len = this.length;
			for(; i<len; ++i) {
				newBuffer[i] = buffer[i];
			}
		} else {
			capacity = buffer.length;
			len = this.tail;
			for(; head<capacity; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}

			for(head=0; head<len; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}
		}

		this.buffer = newBuffer;
		this.head = 0;
		this.tail = this.length;
	};

	return Queue;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],51:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var Queue = require('./Queue');

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._queue = new Queue(15);
		this._afterQueue = new Queue(5);
		this._running = false;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._add(this._queue, task);
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._add(this._afterQueue, task);
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		runQueue(this._queue);
		this._running = false;
		runQueue(this._afterQueue);
	};

	/**
	 * Add a task to the q, and schedule drain if not already scheduled
	 * @param {Queue} queue
	 * @param {{run:function}} task
	 * @private
	 */
	Scheduler.prototype._add = function(queue, task) {
		queue.push(task);
		if(!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Run all the tasks in the q
	 * @param queue
	 */
	function runQueue(queue) {
		while(queue.length > 0) {
			queue.shift().run();
		}
	}

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./Queue":50}],52:[function(require,module,exports){
(function (process){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// vertx and finally fall back to setTimeout

	/*jshint maxcomplexity:6*/
	/*global process,document,setTimeout,MutationObserver,WebKitMutationObserver*/
	var nextTick, MutationObs;

	if (typeof process !== 'undefined' && process !== null &&
		typeof process.nextTick === 'function') {
		nextTick = function(f) {
			process.nextTick(f);
		};

	} else if (MutationObs =
		(typeof MutationObserver === 'function' && MutationObserver) ||
		(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver)) {
		nextTick = (function (document, MutationObserver) {
			var scheduled;
			var el = document.createElement('div');
			var o = new MutationObserver(run);
			o.observe(el, { attributes: true });

			function run() {
				var f = scheduled;
				scheduled = void 0;
				f();
			}

			return function (f) {
				scheduled = f;
				el.setAttribute('class', 'x');
			};
		}(document, MutationObs));

	} else {
		nextTick = (function(cjsRequire) {
			var vertx;
			try {
				// vert.x 1.x || 2.x
				vertx = cjsRequire('vertx');
			} catch (ignore) {}

			if (vertx) {
				if (typeof vertx.runOnLoop === 'function') {
					return vertx.runOnLoop;
				}
				if (typeof vertx.runOnContext === 'function') {
					return vertx.runOnContext;
				}
			}

			// capture setTimeout to avoid being caught by fake timers
			// used in time based tests
			var capturedSetTimeout = setTimeout;
			return function (t) {
				capturedSetTimeout(t, 0);
			};
		}(require));
	}

	return nextTick;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

}).call(this,require('_process'))
},{"_process":12}],53:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @deprecated @param {function=} onProgress progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected) {
			var parent = this._handler;
			var state = parent.join().state();

			if ((typeof onFulfilled !== 'function' && state > 0) ||
				(typeof onRejected !== 'function' && state < 0)) {
				// Short circuit: value will not change, simply share handler
				return new this.constructor(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected,
					arguments.length > 2 ? arguments[2] : void 0);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			var parent = this._handler;
			var child = new Pending(parent.receiver, parent.join().context);
			return new this.constructor(Handler, child);
		};

		// Array combinators

		Promise.all = all;
		Promise.race = race;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			/*jshint maxcomplexity:8*/
			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			var i, h, x, s;
			for (i = 0; i < promises.length; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				if (maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);

					s = h.state();
					if (s === 0) {
						h.fold(settleAt, i, results, resolver);
					} else if (s > 0) {
						results[i] = h.value;
						--pending;
					} else {
						unreportRemaining(promises, i+1, h);
						resolver.become(h);
						break;
					}

				} else {
					results[i] = x;
					--pending;
				}
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function settleAt(i, x, resolver) {
				/*jshint validthis:true*/
				this[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(this));
				}
			}
		}

		function unreportRemaining(promises, start, rejectedHandler) {
			var i, h, x;
			for(i=start; i<promises.length; ++i) {
				x = promises[i];
				if(maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);

					if(h !== rejectedHandler) {
						h.visit(h, void 0, h._unreport);
					}
				}
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			if(Object(promises) === promises && promises.length === 0) {
				return never();
			}

			var h = new Pending();
			var i, x;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x !== void 0 && i in promises) {
					getHandler(x).visit(h, h.resolve, h.reject);
				}
			}
			return new Promise(Handler, h);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for thenable x.
		 * NOTE: You must only call this if maybeThenable(x) == true
		 * @param {object|function|Promise} x
		 * @returns {object} handler
		 */
		function getHandlerMaybeThenable(x) {
			return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.visit(to, function(x) {
				f.call(c, z, x, this);
			}, to.reject, to.notify);
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled) {
				this.rejection.reported = true;
				Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		// TODO: Better names: "annotate"?
		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function noop() {}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],54:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSCore
 * @typechecks
 */

var invariant = require("./invariant");

/**
 * The CSSCore module specifies the API (and implements most of the methods)
 * that should be used when dealing with the display of elements (via their
 * CSS classes and visibility on screen. It is an API focused on mutating the
 * display and not reading it as no logical state should be encoded in the
 * display of elements.
 */

var CSSCore = {

  /**
   * Adds the class passed in to the element if it doesn't already have it.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  addClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.addClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.add(className);
      } else if (!CSSCore.hasClass(element, className)) {
        element.className = element.className + ' ' + className;
      }
    }
    return element;
  },

  /**
   * Removes the class passed in from the element
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @return {DOMElement} the element passed in
   */
  removeClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSSCore.removeClass takes only a single class name. "%s" contains ' +
      'multiple classes.', className
    ) : invariant(!/\s/.test(className)));

    if (className) {
      if (element.classList) {
        element.classList.remove(className);
      } else if (CSSCore.hasClass(element, className)) {
        element.className = element.className
          .replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1')
          .replace(/\s+/g, ' ') // multiple spaces to one
          .replace(/^\s*|\s*$/g, ''); // trim the ends
      }
    }
    return element;
  },

  /**
   * Helper to add or remove a class from an element based on a condition.
   *
   * @param {DOMElement} element the element to set the class on
   * @param {string} className the CSS className
   * @param {*} bool condition to whether to add or remove the class
   * @return {DOMElement} the element passed in
   */
  conditionClass: function(element, className, bool) {
    return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
  },

  /**
   * Tests whether the element has the class specified.
   *
   * @param {DOMNode|DOMWindow} element the element to set the class on
   * @param {string} className the CSS className
   * @return {boolean} true if the element has the class, false if not
   */
  hasClass: function(element, className) {
    ("production" !== process.env.NODE_ENV ? invariant(
      !/\s/.test(className),
      'CSS.hasClass takes only a single class name.'
    ) : invariant(!/\s/.test(className)));
    if (element.classList) {
      return !!className && element.classList.contains(className);
    }
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

};

module.exports = CSSCore;

}).call(this,require('_process'))
},{"./invariant":60,"_process":12}],55:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ExecutionEnvironment
 */

/*jslint evil: true */

"use strict";

var canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners:
    canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

},{}],56:[function(require,module,exports){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
};

module.exports = assign;

},{}],57:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactTransitionEvents
 */

"use strict";

var ExecutionEnvironment = require("./ExecutionEnvironment");

/**
 * EVENT_NAME_MAP is used to determine which event fired when a
 * transition/animation ends, based on the style property used to
 * define that event.
 */
var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];

function detectEvents() {
  var testEl = document.createElement('div');
  var style = testEl.style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are useable, and if not remove them
  // from the map
  if (!('AnimationEvent' in window)) {
    delete EVENT_NAME_MAP.animationend.animation;
  }

  if (!('TransitionEvent' in window)) {
    delete EVENT_NAME_MAP.transitionend.transition;
  }

  for (var baseEventName in EVENT_NAME_MAP) {
    var baseEvents = EVENT_NAME_MAP[baseEventName];
    for (var styleName in baseEvents) {
      if (styleName in style) {
        endEvents.push(baseEvents[styleName]);
        break;
      }
    }
  }
}

if (ExecutionEnvironment.canUseDOM) {
  detectEvents();
}

// We use the raw {add|remove}EventListener() call because EventListener
// does not know how to remove event listeners and we really should
// clean up. Also, these events are not triggered in older browsers
// so we should be A-OK here.

function addEventListener(node, eventName, eventListener) {
  node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
  node.removeEventListener(eventName, eventListener, false);
}

var ReactTransitionEvents = {
  addEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      // If CSS transitions are not supported, trigger an "end animation"
      // event immediately.
      window.setTimeout(eventListener, 0);
      return;
    }
    endEvents.forEach(function(endEvent) {
      addEventListener(node, endEvent, eventListener);
    });
  },

  removeEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      return;
    }
    endEvents.forEach(function(endEvent) {
      removeEventListener(node, endEvent, eventListener);
    });
  }
};

module.exports = ReactTransitionEvents;

},{"./ExecutionEnvironment":55}],58:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule cx
 */

/**
 * This function is used to mark string literals representing CSS class names
 * so that they can be transformed statically. This allows for modularization
 * and minification of CSS class names.
 *
 * In static_upstream, this function is actually implemented, but it should
 * eventually be replaced with something more descriptive, and the transform
 * that is used in the main stack should be ported for use elsewhere.
 *
 * @param string|object className to modularize, or an object of key/values.
 *                      In the object case, the values are conditions that
 *                      determine if the className keys should be included.
 * @param [string ...]  Variable list of classNames in the string case.
 * @return string       Renderable space-separated CSS className.
 */
function cx(classNames) {
  if (typeof classNames == 'object') {
    return Object.keys(classNames).filter(function(className) {
      return classNames[className];
    }).join(' ');
  } else {
    return Array.prototype.join.call(arguments, ' ');
  }
}

module.exports = cx;

},{}],59:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule emptyFunction
 */

function makeEmptyFunction(arg) {
  return function() {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() { return this; };
emptyFunction.thatReturnsArgument = function(arg) { return arg; };

module.exports = emptyFunction;

},{}],60:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":12}],61:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule warning
 */

"use strict";

var emptyFunction = require("./emptyFunction");

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if ("production" !== process.env.NODE_ENV) {
  warning = function(condition, format ) {for (var args=[],$__0=2,$__1=arguments.length;$__0<$__1;$__0++) args.push(arguments[$__0]);
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (!condition) {
      var argIndex = 0;
      console.warn('Warning: ' + format.replace(/%s/g, function()  {return args[argIndex++];}));
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))
},{"./emptyFunction":59,"_process":12}],62:[function(require,module,exports){
module.exports={"Immutable":{"doc":{"synopsis":"Immutable data encourages pure functions (data-in, data-out) and lends itself\nto much simpler application development and enabling techniques from\nfunctional programming such as lazy evaluation.","description":"While designed to bring these powerful functional concepts to JavaScript, it\npresents an Object-Oriented API familiar to Javascript engineers and closely\nmirroring that of Array, Map, and Set. It is easy and efficient to convert to\nand from plain Javascript types."},"module":{"is":{"call":{"signatures":[{"params":[{"name":"first","type":{"k":0}},{"name":"second","type":{"k":0}}],"type":{"k":1},"line":21}],"doc":{"synopsis":"Vaule equality check with semantics similar to Object.is(), but treats\nImmutable collections and sequences as values, equal if the second\nImmutable iterable contains equivalent values. It's used throughout when\nchecking for equality.","description":"    var map1 = Immutable.Map({a:1, b:1, c:1});\n    var map2 = Immutable.Map({a:1, b:1, c:1});\n    assert(map1 !== map2);\n    assert(Object.is(map1, map2) === false);\n    assert(Immutable.is(map1, map2) === true);\n"}}},"fromJS":{"call":{"signatures":[{"params":[{"name":"json","type":{"k":0}},{"name":"reviver","optional":true,"type":{"k":6,"params":[{"name":"k","type":{"k":0}},{"name":"v","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}}],"type":{"k":0}}}],"type":{"k":0},"line":36}],"doc":{"synopsis":"Deeply converts plain JS objects and arrays to Immutable Maps and Lists.","description":"If a `reviver` is optionally provided, it will be called with every\ncollection as a Seq (beginning with the most nested collections\nand proceeding to the top-level collection itself), along with the key\nrefering to each collection and the parent JS object provided as `this`.\nFor the top level, object, the key will be \"\". This `reviver` is expected\nto return a new Immutable Iterable, allowing for custom convertions from\ndeep JS objects.\n\nThis example converts JSON to List and OrderedMap:\n\n    Immutable.fromJS({a: {b: [10, 20, 30]}, c: 40}, function (key, value) {\n      var isIndexed = Immutable.Iterable.isIndexed(value);\n      return isIndexed ? value.toList() : value.toOrderedMap();\n    });\n\n    // true, \"b\", {b: [10, 20, 30]}\n    // false, \"a\", {a: {b: [10, 20, 30]}, c: 40}\n    // false, \"\", {\"\": {a: {b: [10, 20, 30]}, c: 40}}\n\nIf `reviver` is not provided, the default behavior will convert Arrays into\nLists and Objects into Maps.\n\n`reviver` acts similarly to [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).\n\n`Immutable.fromJS` is conservative in it's conversion. It will only convert\narrays which pass `Array.isArray` to Lists, and only raw objects (no custom\nprototype) to Map."}}},"Iterable":{"doc":{"synopsis":"The `Iterable` is a set of (key, value) entries which can be iterated, and\nis the base class for all collections in `immutable`, allowing them to\nmake use of all the Iterable methods (such as `map` and `filter`).","description":"Note: An iterable is always iterated in the same order, however that order\nmay not always be well defined, as is the case for the `Map` and `Set`."},"module":{"isIterable":{"call":{"signatures":[{"params":[{"name":"maybeIterable","type":{"k":0}}],"type":{"k":1},"line":84}],"doc":{"synopsis":"True if `maybeIterable` is an Iterable, or any of its subclasses."}}},"isKeyed":{"call":{"signatures":[{"params":[{"name":"maybeKeyed","type":{"k":0}}],"type":{"k":1},"line":88}],"doc":{"synopsis":"True if `maybeKeyed` is a KeyedIterable, or any of its subclasses."}}},"isIndexed":{"call":{"signatures":[{"params":[{"name":"maybeIndexed","type":{"k":0}}],"type":{"k":1},"line":93}],"doc":{"synopsis":"True if `maybeIndexed` is a IndexedIterable, or any of its subclasses."}}},"isAssociative":{"call":{"signatures":[{"params":[{"name":"maybeAssociative","type":{"k":0}}],"type":{"k":1},"line":98}],"doc":{"synopsis":"True if `maybeAssociative` is either a keyed or indexed Iterable."}}},"isOrdered":{"call":{"signatures":[{"params":[{"name":"maybeOrdered","type":{"k":0}}],"type":{"k":1},"line":103}],"doc":{"synopsis":"True if `maybeOrdered` is an Iterable where iteration order is well\ndefined. True for IndexedIterable as well as OrderedMap and OrderedSet."}}}},"call":{"signatures":[{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":110},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":127},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":3},{"k":7,"param":"V"}]},"line":128},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":129},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":130},{"typeParams":["V"],"params":[{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"V"}]},"line":131}],"doc":{"synopsis":"Creates an Iterable.","description":"The type of Iterable created is based on the input.\n\n  * If an `Iterable`, that same `Iterable`.\n  * If an Array-like, an `IndexedIterable`.\n  * If an Object with an Iterator, an `IndexedIterable`.\n  * If an Iterator, an `IndexedIterable`.\n  * If an Object, a `KeyedIterable`.\n\nThis methods forces the conversion of Objects and Strings to Iterables.\nIf you want to ensure that a Iterable of one item is returned, use\n`Seq.of`."}},"interface":{"line":132,"typeParams":["K","V"],"groups":[{"title":"Value equality","methods":{"#equals":{"signatures":[{"params":[{"name":"other","type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1},"line":135}],"doc":{"synopsis":"True if this and the other Iterable have value equality, as defined\nby `Immutable.is()`.","description":"Note: This is equivalent to `Immutable.is(this, other)`, but provided to\nallow for chained expressions."}}}},{"title":"Reading values","methods":{"#get":{"signatures":[{"params":[{"name":"key","type":{"k":7,"param":"K"}},{"name":"notSetValue","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"},"line":146}],"doc":{"synopsis":"Returns the value associated with the provided key, or notSetValue if\nthe Iterable does not contain this key.","description":"Note: it is possible a key may be associated with an `undefined` value, so\nif `notSetValue` is not provided and this method returns `undefined`,\nthat does not guarantee the key was not found."}},"#has":{"signatures":[{"params":[{"name":"key","type":{"k":7,"param":"K"}}],"type":{"k":1},"line":159}],"doc":{"synopsis":"True if a key exists within this `Iterable`."}},"#contains":{"signatures":[{"params":[{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":1},"line":164}],"doc":{"synopsis":"True if a value exists within this `Iterable`."}},"#first":{"signatures":[{"type":{"k":7,"param":"V"},"line":169}],"doc":{"synopsis":"The first value in the Iterable."}},"#last":{"signatures":[{"type":{"k":7,"param":"V"},"line":174}],"doc":{"synopsis":"The last value in the Iterable."}}}},{"title":"Reading deep values","methods":{"#getIn":{"signatures":[{"params":[{"name":"searchKeyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"notSetValue","optional":true,"type":{"k":0}}],"type":{"k":0},"line":179},{"params":[{"name":"searchKeyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"notSetValue","optional":true,"type":{"k":0}}],"type":{"k":0},"line":188}],"doc":{"synopsis":"Returns the value found by following a path of keys or indices through\nnested Iterables."}}}},{"title":"Conversion to JavaScript types","methods":{"#toJS":{"signatures":[{"type":{"k":0},"line":189}],"doc":{"synopsis":"Deeply converts this Iterable to equivalent JS.","description":"`IndexedIterables`, and `SetIterables` become Arrays, while\n`KeyedIterables` become Objects."}},"#toArray":{"signatures":[{"type":{"k":8,"name":"Array","args":[{"k":7,"param":"V"}]},"line":200}],"doc":{"synopsis":"Shallowly converts this iterable to an Array, discarding keys."}},"#toObject":{"signatures":[{"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]},"line":205}],"doc":{"synopsis":"Shallowly converts this Iterable to an Object.","description":"Throws if keys are not strings."}}}},{"title":"Conversion to Collections","methods":{"#toMap":{"signatures":[{"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":212}],"doc":{"synopsis":"Converts this Iterable to a Map, Throws if keys are not hashable.","description":"Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided\nfor convenience and to allow for chained expressions."}},"#toOrderedMap":{"signatures":[{"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":223}],"doc":{"synopsis":"Converts this Iterable to a Map, maintaining the order of iteration.","description":"Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but\nprovided for convenience and to allow for chained expressions."}},"#toSet":{"signatures":[{"type":{"k":8,"name":"Set","args":[{"k":7,"param":"V"}]},"line":231}],"doc":{"synopsis":"Converts this Iterable to a Set, discarding keys. Throws if values\nare not hashable.","description":"Note: This is equivalent to `Set(this)`, but provided to allow for\nchained expressions."}},"#toOrderedSet":{"signatures":[{"type":{"k":8,"name":"Set","args":[{"k":7,"param":"V"}]},"line":240}],"doc":{"synopsis":"Converts this Iterable to a Set, maintaining the order of iteration and\ndiscarding keys.","description":"Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided\nfor convenience and to allow for chained expressions."}},"#toList":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"V"}]},"line":249}],"doc":{"synopsis":"Converts this Iterable to a List, discarding keys.","description":"Note: This is equivalent to `List(this)`, but provided to allow\nfor chained expressions."}},"#toStack":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"V"}]},"line":257}],"doc":{"synopsis":"Converts this Iterable to a Stack, discarding keys. Throws if values\nare not hashable.","description":"Note: This is equivalent to `Stack(this)`, but provided to allow for\nchained expressions."}}}},{"title":"Conversion to lazy Seq","methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":266}],"doc":{"synopsis":"Converts this Iterable to a Seq of the same kind (indexed,\nkeyed, or set)."}},"#toKeyedSeq":{"signatures":[{"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":275}],"doc":{"synopsis":"Returns a KeyedSeq from this Iterable where indices are treated as keys.","description":"This is useful if you want to operate on an\nIndexedIterable and preserve the [index, value] pairs.\n\nThe returned Seq will have identical iteration order as\nthis Iterable.\n\nExample:\n\n    var indexedSeq = Immutable.Seq.of('A', 'B', 'C');\n    indexedSeq.filter(v => v === 'B').toString() // Seq [ 'B' ]\n    var keyedSeq = indexedSeq.toKeyedSeq();\n    keyedSeq.filter(v => v === 'B').toString() // Seq { 1: 'B' }\n"}},"#toIndexedSeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"V"}]},"line":294}],"doc":{"synopsis":"Returns an IndexedSeq of the values of this Iterable, discarding keys."}},"#toSetSeq":{"signatures":[{"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"V"}]},"line":299}],"doc":{"synopsis":"Returns a SetSeq of the values of this Iterable, discarding keys."}}}},{"title":"Iterators","methods":{"#keys":{"signatures":[{"type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"K"}]},"line":304}],"doc":{"synopsis":"An iterator of this `Iterable`'s keys."}},"#values":{"signatures":[{"type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"V"}]},"line":312}],"doc":{"synopsis":"An iterator of this `Iterable`'s values."}},"#entries":{"signatures":[{"type":{"k":8,"name":"Iterator","args":[{"k":8,"name":"Array","args":[{"k":0}]}]},"line":317}],"doc":{"synopsis":"An iterator of this `Iterable`'s entries as `[key, value]` tuples."}}}},{"title":"Iterables (lazy Seq)","methods":{"#keySeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"K"}]},"line":322}],"doc":{"synopsis":"Returns a new IndexedSeq of the keys of this Iterable,\ndiscarding values."}},"#valueSeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"V"}]},"line":331}],"doc":{"synopsis":"Returns an IndexedSeq of the values of this Iterable, discarding keys."}},"#entrySeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":8,"name":"Array","args":[{"k":0}]}]},"line":336}],"doc":{"synopsis":"Returns a new IndexedSeq of [key, value] tuples."}}}},{"title":"Higher-order Collection methods (ES6)","methods":{"#concat":{"signatures":[{"params":[{"name":"valuesOrIterables","varArgs":true,"type":{"k":5,"type":{"k":0}}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":341}],"doc":{"synopsis":"Returns a new Iterable of the same type with other values and\niterable-like concatenated to this one.","description":"For Seqs, all entries will be present in\nthe resulting iterable, even if they have the same key."}},"#every":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":1},"line":353}],"doc":{"synopsis":"True if `predicate` returns true for all entries in the Iterable."}},"#filter":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":361}],"doc":{"synopsis":"Returns a new Iterable of the same type with only the entries for which\nthe `predicate` function returns true.","description":"    Seq({a:1,b:2,c:3,d:4}).filter(x => x % 2 === 0)\n    // Seq { b: 2, d: 4 }\n"}},"#find":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}},{"name":"notSetValue","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"},"line":374}],"doc":{"synopsis":"Returns the value for which the `predicate` returns true."}},"#forEach":{"signatures":[{"params":[{"name":"sideEffect","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":0}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":2},"line":383}],"doc":{"synopsis":"The `sideEffect` is executed for every entry in the Iterable.","description":"Unlike `Array.prototype.forEach`, if any call of `sideEffect` returns\n`false`, the iteration will stop. Returns the number of entries iterated\n(including the last iteration which returned false)."}},"#join":{"signatures":[{"params":[{"name":"separator","optional":true,"type":{"k":3}}],"type":{"k":3},"line":395}],"doc":{"synopsis":"Joins values together as a string, inserting a separator between each.\nThe default separator is \",\"."}},"#map":{"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"M"}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"M"}]},"line":401}],"doc":{"synopsis":"Returns a new Iterable of the same type with values passed through a\n`mapper` function.","description":"    Seq({ a: 1, b: 2 }).map(x => 10 * x)\n    // Seq { a: 10, b: 20 }\n"}},"#reduce":{"signatures":[{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":6,"params":[{"name":"reduction","optional":true,"type":{"k":7,"param":"R"}},{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"R"}}},{"name":"initialReduction","optional":true,"type":{"k":7,"param":"R"}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":7,"param":"R"},"line":414}],"doc":{"synopsis":"Reduces the Iterable to a value by calling the `reducer` for every entry\nin the Iterable and passing along the reduced value.","notes":[{"name":"see","body":"`Array.prototype.reduce`."}],"description":"If `initialReduction` is not provided, or is null, the first item in the\nIterable will be used.\n"}},"#reduceRight":{"signatures":[{"typeParams":["R"],"params":[{"name":"reducer","type":{"k":6,"params":[{"name":"reduction","optional":true,"type":{"k":7,"param":"R"}},{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"R"}}},{"name":"initialReduction","optional":true,"type":{"k":7,"param":"R"}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":7,"param":"R"},"line":429}],"doc":{"synopsis":"Reduces the Iterable in reverse (from the right side).","description":"Note: Similar to this.reverse().reduce(), and provided for parity\nwith `Array#reduceRight`."}},"#reverse":{"signatures":[{"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":441}],"doc":{"synopsis":"Returns a new Iterable of the same type in reverse order."}},"#slice":{"signatures":[{"params":[{"name":"begin","optional":true,"type":{"k":2}},{"name":"end","optional":true,"type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":446}],"doc":{"synopsis":"Returns a new Iterable of the same type representing a portion of this\nIterable from start up to but not including end.","description":"If begin is negative, it is offset from the end of the Iterable. e.g.\n`slice(-2)` returns a Iterable of the last two entries. If it is not\nprovided the new Iterable will begin at the beginning of this Iterable.\n\nIf end is negative, it is offset from the end of the Iterable. e.g.\n`slice(0, -1)` returns an Iterable of everything but the last entry. If\nit is not provided, the new Iterable will continue through the end of\nthis Iterable.\n\nIf the requested slice is equivalent to the current Iterable, then it\nwill return itself."}},"#some":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":1},"line":464}],"doc":{"synopsis":"True if `predicate` returns true for any entry in the Iterable."}},"#sort":{"signatures":[{"params":[{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"V"}},{"name":"valueB","type":{"k":7,"param":"V"}}],"type":{"k":2}}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":472}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains the same entries,\nstably sorted by using a `comparator`.","description":"If a `comparator` is not provided, a default comparator uses `<` and `>`.\n\n`comparator(valueA, valueB)`:\n\n  * Returns `0` if the elements should not be swapped.\n  * Returns `-1` (or any negative number) if `valueA` comes before `valueB`\n  * Returns `1` (or any positive number) if `valueA` comes after `valueB`\n  * Is pure, i.e. it must always return the same value for the same pair\n    of values.\n\nWhen sorting collections which have no defined order, their ordered\nequivalents will be returned. e.g. `map.sort()` returns OrderedMap."}}}},{"title":"Higher-order collection methods","methods":{"#butLast":{"signatures":[{"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":491}],"doc":{"synopsis":"Returns a new Iterable of the same type containing all entries except\nthe last."}},"#count":{"signatures":[{"type":{"k":2},"line":500},{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":2},"line":512}],"doc":{"synopsis":"Returns the size of this Iterable.","description":"Regardless of if this Iterable can describe its size lazily (some Seqs\ncannot), this method will always return the correct size. E.g. it\nevaluates a lazy `Seq` if necessary.\n\nIf `predicate` is provided, then this returns the count of entries in the\nIterable for which the `predicate` returns true."}},"#countBy":{"signatures":[{"typeParams":["G"],"params":[{"name":"grouper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"G"}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"G"},{"k":2}]},"line":516}],"doc":{"synopsis":"Returns a `KeyedSeq` of counts, grouped by the return value of\nthe `grouper` function.","description":"Note: This is not a lazy operation."}},"#filterNot":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":527}],"doc":{"synopsis":"Returns a new Iterable of the same type with only the entries for which\nthe `predicate` function returns false.","description":"    Seq({a:1,b:2,c:3,d:4}).filterNot(x => x % 2 === 0)\n    // Seq { a: 1, c: 3 }\n"}},"#findLast":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}},{"name":"notSetValue","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"},"line":540}],"doc":{"synopsis":"Returns the last value for which the `predicate` returns true.","description":"Note: `predicate` will be called for each entry in reverse."}},"#flatMap":{"signatures":[{"typeParams":["MK","MV"],"params":[{"name":"mapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"MK"},{"k":7,"param":"MV"}]}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"MK"},{"k":7,"param":"MV"}]},"line":551},{"typeParams":["MK","MV"],"params":[{"name":"mapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":0}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"MK"},{"k":7,"param":"MV"}]},"line":559}],"doc":{"synopsis":"Flat-maps the Iterable, returning an Iterable of the same type."}},"#flatten":{"signatures":[{"params":[{"name":"depth","optional":true,"type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]},"line":563},{"params":[{"name":"shallow","optional":true,"type":{"k":1}}],"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]},"line":578}],"doc":{"synopsis":"Flattens nested Iterables.","description":"Will deeply flatten the Iterable by default, returning an Iterable of the\nsame type, but a `depth` can be provided in the form of a number or\nboolean (where true means to shallowly flatten one level). A depth of 0\n(or shallow: false) will deeply flatten.\n\nFlattens only others Iterable, not Arrays or Objects.\n\nNote: `flatten(true)` operates on Iterable<any, Iterable<K, V>> and\nreturns Iterable<K, V>"}},"#groupBy":{"signatures":[{"typeParams":["G"],"params":[{"name":"grouper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"G"}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"G"},{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}]},"line":579}],"doc":{"synopsis":"Returns a `KeyedIterable` of `KeyedIterables`, grouped by the return\nvalue of the `grouper` function.","description":"Note: This is not a lazy operation."}},"#isSubset":{"signatures":[{"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"V"}]}}],"type":{"k":1},"line":590},{"params":[{"name":"iter","type":{"k":8,"name":"Array","args":[{"k":7,"param":"V"}]}}],"type":{"k":1},"line":595}],"doc":{"synopsis":"True if `iter` contains every value in this Iterable."}},"#isSuperset":{"signatures":[{"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"V"}]}}],"type":{"k":1},"line":596},{"params":[{"name":"iter","type":{"k":8,"name":"Array","args":[{"k":7,"param":"V"}]}}],"type":{"k":1},"line":601}],"doc":{"synopsis":"True if this Iterable contains every value in `iter`."}},"#max":{"signatures":[{"params":[{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"V"}},{"name":"valueB","type":{"k":7,"param":"V"}}],"type":{"k":2}}}],"type":{"k":7,"param":"V"},"line":602}],"doc":{"synopsis":"Returns the maximum value in this collection. If any values are\ncomparatively equivalent, the first one found will be returned.","description":"The `comparator` is used in the same way as `Iterable#sort`. If it is not\nprovided, the default comparator is `a > b`."}},"#maxBy":{"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"C"}}},{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"C"}},{"name":"valueB","type":{"k":7,"param":"C"}}],"type":{"k":2}}}],"type":{"k":7,"param":"V"},"line":611}],"doc":{"synopsis":"Like `max`, but also accepts a `comparatorValueMapper` which allows for\ncomparing by more sophisticated means:","description":"    hitters.maxBy(hitter => hitter.avgHits);\n"}},"#min":{"signatures":[{"params":[{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"V"}},{"name":"valueB","type":{"k":7,"param":"V"}}],"type":{"k":2}}}],"type":{"k":7,"param":"V"},"line":623}],"doc":{"synopsis":"Returns the maximum value in this collection. If any values are\ncomparatively equivalent, the first one found will be returned.","description":"The `comparator` is used in the same way as `Iterable#sort`. If it is not\nprovided, the default comparator is `a > b`."}},"#minBy":{"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"C"}}},{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"C"}},{"name":"valueB","type":{"k":7,"param":"C"}}],"type":{"k":2}}}],"type":{"k":7,"param":"V"},"line":632}],"doc":{"synopsis":"Like `min`, but also accepts a `comparatorValueMapper` which allows for\ncomparing by more sophisticated means:","description":"    hitters.minBy(hitter => hitter.avgHits);\n"}},"#rest":{"signatures":[{"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":644}],"doc":{"synopsis":"Returns a new Iterable of the same type containing all entries except\nthe first."}},"#skip":{"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":650}],"doc":{"synopsis":"Returns a new Iterable of the same type which excludes the first `amount`\nentries from this Iterable."}},"#skipLast":{"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":656}],"doc":{"synopsis":"Returns a new Iterable of the same type which excludes the last `amount`\nentries from this Iterable."}},"#skipWhile":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":662}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains entries starting\nfrom when `predicate` first returns false.","description":"    Seq.of('dog','frog','cat','hat','god')\n      .skipWhile(x => x.match(/g/))\n    // Seq [ 'cat', 'hat', 'god' ]\n"}},"#skipUntil":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":676}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains entries starting\nfrom when `predicate` first returns true.","description":"    Seq.of('dog','frog','cat','hat','god')\n      .skipUntil(x => x.match(/hat/))\n    // Seq [ 'hat', 'god' ]\n"}},"#sortBy":{"signatures":[{"typeParams":["C"],"params":[{"name":"comparatorValueMapper","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"C"}}},{"name":"comparator","optional":true,"type":{"k":6,"params":[{"name":"valueA","type":{"k":7,"param":"C"}},{"name":"valueB","type":{"k":7,"param":"C"}}],"type":{"k":2}}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":690}],"doc":{"synopsis":"Like `sort`, but also accepts a `comparatorValueMapper` which allows for\nsorting by more sophisticated means:","description":"    hitters.sortBy(hitter => hitter.avgHits);\n"}},"#take":{"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":702}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains the first `amount`\nentries from this Iterable."}},"#takeLast":{"signatures":[{"params":[{"name":"amount","type":{"k":2}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":708}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains the last `amount`\nentries from this Iterable."}},"#takeWhile":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":714}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains entries from this\nIterable as long as the `predicate` returns true.","description":"    Seq.of('dog','frog','cat','hat','god')\n      .takeWhile(x => x.match(/o/))\n    // Seq [ 'dog', 'frog' ]\n"}},"#takeUntil":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":728}],"doc":{"synopsis":"Returns a new Iterable of the same type which contains entries from this\nIterable as long as the `predicate` returns false.","description":"    Seq.of('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))\n    // ['dog', 'frog']\n"}}}}]}},"KeyedIterable":{"doc":{"synopsis":"Keyed Iterables have discrete keys tied to each value.","description":"When iterating `KeyedIterable`, each iteration will yield a `[K, V]` tuple,\nin other words, `Iterable#entries` is the default iterator for Keyed\nIterables."},"module":{},"call":{"signatures":[{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":762},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":770},{"typeParams":["K","V"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":0}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":771},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":3},{"k":7,"param":"V"}]},"line":772},{"typeParams":["K","V"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":0}]}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":773},{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":774}],"doc":{"synopsis":"Creates a KeyedIterable","description":"Similar to `Iterable()`, however it expects iterable-likes of [K, V]\ntuples if not constructed from a KeyedIterable or JS Object."}},"interface":{"line":775,"typeParams":["K","V"],"extends":[{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":778}],"doc":{"synopsis":"Returns KeyedSeq."}}}},{"title":"Higher-order collection methods","methods":{"#flip":{"signatures":[{"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"V"},{"k":7,"param":"K"}]},"line":784}],"doc":{"synopsis":"Returns a new KeyedIterable of the same type where the keys and values\nhave been flipped.","description":"    Seq({ a: 'z', b: 'y' }).flip() // { z: 'a', y: 'b' }\n"}},"#findKey":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":7,"param":"K"},"line":796}],"doc":{"synopsis":"Returns the key for which the `predicate` returns true."}},"#findLastKey":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"iter","optional":true,"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":7,"param":"K"},"line":804}],"doc":{"synopsis":"Returns the last key for which the `predicate` returns true.","description":"Note: `predicate` will be called for each entry in reverse."}},"#keyOf":{"signatures":[{"params":[{"name":"searchValue","type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"K"},"line":814}],"doc":{"synopsis":"Returns the key associated with the search value, or undefined."}},"#lastKeyOf":{"signatures":[{"params":[{"name":"searchValue","type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"K"},"line":819}],"doc":{"synopsis":"Returns the last key associated with the search value, or undefined."}},"#mapEntries":{"signatures":[{"typeParams":["KM","VM"],"params":[{"name":"mapper","type":{"k":6,"params":[{"name":"entry","optional":true,"type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"index","optional":true,"type":{"k":2}},{"name":"iter","optional":true,"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Array","args":[{"k":0}]}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"KM"},{"k":7,"param":"VM"}]},"line":824}],"doc":{"synopsis":"Returns a new KeyedIterable of the same type with entries\n([key, value] tuples) passed through a `mapper` function.","description":"    Seq({ a: 1, b: 2 })\n      .mapEntries(([k, v]) => [k.toUpperCase(), v * 2])\n    // Seq { A: 2, B: 4 }\n"}},"#mapKeys":{"signatures":[{"typeParams":["M"],"params":[{"name":"mapper","type":{"k":6,"params":[{"name":"key","optional":true,"type":{"k":7,"param":"K"}},{"name":"value","optional":true,"type":{"k":7,"param":"V"}},{"name":"iter","optional":true,"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":7,"param":"M"}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"M"},{"k":7,"param":"V"}]},"line":838}],"doc":{"synopsis":"Returns a new KeyedIterable of the same type with keys passed through a\n`mapper` function.","description":"    Seq({ a: 1, b: 2 })\n      .mapKeys(x => x.toUpperCase())\n    // Seq { A: 1, B: 2 }\n"}}}}]}},"IndexedIterable":{"doc":{"synopsis":"Indexed Iterables have incrementing numeric keys. They exhibit\nslightly different behavior than `KeyedIterable` for some methods in order\nto better mirror the behavior of JavaScript's `Array`, and add methods\nwhich do not make sense on non-indexed Iterables such as `indexOf`.","description":"Unlike JavaScript arrays, `IndexedIterable`s are always dense. \"Unset\"\nindices and `undefined` indices are indistinguishable, and all indices from\n0 to `size` are visited when iterated.\n\nAll IndexedIterable methods return re-indexed Iterables. In other words,\nindices always start at 0 and increment until size. If you wish to\npreserve indices, using them as keys, convert to a KeyedIterable by calling\n`toKeyedSeq`."},"module":{},"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":871},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":876},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":0}]},"line":877},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":878},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":879},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":880}],"doc":{"synopsis":"Creates a new IndexedIterable."}},"interface":{"line":881,"typeParams":["T"],"extends":[{"k":8,"name":"Iterable","args":[{"k":2},{"k":7,"param":"T"}]}],"groups":[{"title":"Reading values","methods":{"#get":{"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"notSetValue","optional":true,"type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"},"line":884}],"doc":{"synopsis":"Returns the value associated with the provided index, or notSetValue if\nthe index is beyond the bounds of the Iterable.","description":"`index` may be a negative number, which indexes back from the end of the\nIterable. `s.get(-1)` gets the last item in the Iterable."}}}},{"title":"Conversion to lazy Seq","methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":895}],"doc":{"synopsis":"Returns IndexedSeq."}},"#fromEntrySeq":{"signatures":[{"type":{"k":8,"name":"KeyedSeq","args":[{"k":0},{"k":0}]},"line":904}],"doc":{"synopsis":"If this is an iterable of [key, value] entry tuples, it will return a\nKeyedSeq of those entries."}}}},{"title":"Persistent changes","methods":{"#splice":{"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"removeNum","type":{"k":2}},{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":0}}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":910}],"doc":{"synopsis":"Splice returns a new indexed Iterable by replacing a region of this\nIterable with new values. If values are not provided, it only skips the\nregion to be removed.","description":"`index` may be a negative number, which indexes back from the end of the\nIterable. `s.splice(-2)` splices after the second to last item.\n\n    Seq(['a','b','c','d']).splice(1, 2, 'q', 'r', 's')\n    // Seq ['a', 'q', 'r', 's', 'd']\n"}}}},{"title":"Higher-order Collection methods (ES6)","methods":{"#findIndex":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"T"}},{"name":"index","optional":true,"type":{"k":2}},{"name":"iter","optional":true,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":2},"line":931}],"doc":{"synopsis":"Returns the first index in the Iterable where a value satisfies the\nprovided predicate function. Otherwise -1 is returned."}},"#indexOf":{"signatures":[{"params":[{"name":"searchValue","type":{"k":7,"param":"T"}}],"type":{"k":2},"line":943}],"doc":{"synopsis":"Returns the first index at which a given value can be found in the\nIterable, or -1 if it is not present."}},"#lastIndexOf":{"signatures":[{"params":[{"name":"searchValue","type":{"k":7,"param":"T"}}],"type":{"k":2},"line":949}],"doc":{"synopsis":"Returns the last index at which a given value can be found in the\nIterable, or -1 if it is not present."}}}},{"title":"Higher-order collection methods","methods":{"#findLastIndex":{"signatures":[{"params":[{"name":"predicate","type":{"k":6,"params":[{"name":"value","optional":true,"type":{"k":7,"param":"T"}},{"name":"index","optional":true,"type":{"k":2}},{"name":"iter","optional":true,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":1}}},{"name":"context","optional":true,"type":{"k":0}}],"type":{"k":2},"line":955}],"doc":{"synopsis":"Returns the last index in the Iterable where a value satisfies the\nprovided predicate function. Otherwise -1 is returned."}},"#interpose":{"signatures":[{"params":[{"name":"separator","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]},"line":967}],"doc":{"synopsis":"Returns an Iterable of the same type with `separator` between each item\nin this Iterable."}}}}]}},"SetIterable":{"doc":{"synopsis":"Set Iterables only represent values. They have no associated keys or\nindices. Duplicate values are possible in SetSeqs, however the\nconcrete `Set` does not allow duplicate values.","description":"Iterable methods on SetIterable such as `map` and `forEach` will provide\nthe value as both the first and second arguments to the provided function.\n\n    var seq = SetSeq.of('A', 'B', 'C');\n    assert.equal(seq.every((v, k) => v === k), true);\n"},"module":{},"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]},"line":989},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]},"line":994},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"SetIterable","args":[{"k":0}]},"line":995},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]},"line":996},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]},"line":997},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]},"line":998}],"doc":{"synopsis":"Similar to `Iterable()`, but always returns a SetIterable."}},"interface":{"line":999,"typeParams":["T"],"extends":[{"k":8,"name":"Iterable","args":[{"k":7,"param":"T"},{"k":7,"param":"T"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1002}],"doc":{"synopsis":"Returns SetSeq."}}}}]}},"Seq":{"doc":{"synopsis":"**Sequences are immutable** — Once a sequence is created, it cannot be\nchanged, appended to, rearranged or otherwise modified. Instead, any\nmutative method called on a sequence will return a new immutable sequence.","description":"**Sequences are lazy** — Sequences do as little work as necessary to\nrespond to any method call.\n\nFor example, the following does no work, because the resulting sequence is\nnever used:\n\n    var oddSquares = Immutable.Seq.of(1,2,3,4,5,6,7,8)\n      .filter(x => x % 2).map(x => x * x);\n\nOnce the sequence is used, it performs only the work necessary. In this\nexample, no intermediate arrays are ever created, filter is only called\nthree times, and map is only called twice:\n\n    console.log(evenSquares.get(1)); // 9\n\nLazy Sequences allow for the efficient chaining of sequence operations,\nallowing for the expression of logic that can otherwise be very tedious:\n\n    Immutable.Seq({a:1, b:1, c:1})\n      .flip().map(key => key.toUpperCase()).flip().toObject();\n    // Map { A: 1, B: 1, C: 1 }\n\nAs well as expressing logic that would otherwise seem memory-limited:\n\n    Immutable.Range(1, Infinity)\n      .skip(1000)\n      .map(n => -n)\n      .filter(n => n % 2 === 0)\n      .take(2)\n      .reduce((r, n) => r * n, 1);\n    // 1006008\n"},"module":{"isSeq":{"call":{"signatures":[{"params":[{"name":"maybeSeq","type":{"k":0}}],"type":{"k":1},"line":1051}],"doc":{"synopsis":"True if `maybeSeq` is a Seq, it is not backed by a concrete\nstructure such as Map, List, or Set."}}},"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1056}],"doc":{"synopsis":"Returns a Seq of the values provided. Alias for `IndexedSeq.of()`."}}}},"call":{"signatures":[{"typeParams":["K","V"],"type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1062},{"typeParams":["K","V"],"params":[{"name":"seq","type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1077},{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1078},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1079},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":3},{"k":7,"param":"V"}]},"line":1080},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1081},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1082}],"doc":{"synopsis":"Creates a Seq.","description":"Returns a particular kind of `Seq` based on the input.\n\n  * If a `Seq`, that same `Seq`.\n  * If an `Iterable`, a `Seq` of the same kind (Keyed, Indexed, or Set).\n  * If an Array-like, an `IndexedSeq`.\n  * If an Object with an Iterator, an `IndexedSeq`.\n  * If an Iterator, an `IndexedSeq`.\n  * If an Object, a `KeyedSeq`.\n"}},"interface":{"line":1083,"typeParams":["K","V"],"extends":[{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"properties":{"#size":{"line":1085,"doc":{"synopsis":"Some Seqs can describe their size lazily. When this is the case,\nsize will be an integer. Otherwise it will be undefined.","description":"For example, Seqs returned from map() or reverse()\npreserve the size of the original Seq while filter() does not.\n\nNote: Ranges, Repeats and Seqs made from Arrays and Objects will\nalways have a size."},"type":{"k":2}}}},{"title":"Force evaluation","methods":{"#cacheResult":{"signatures":[{"type":{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1097}],"doc":{"synopsis":"Because Sequences are lazy and designed to be chained together, they do\nnot cache their results. For example, this map function is called 6 times:","description":"    var squares = Seq.of(1,2,3).map(x => x * x);\n    squares.join() + squares.join();\n\nIf you know a derived sequence will be used multiple times, it may be more\nefficient to first cache it. Here, map is called 3 times:\n\n    var squares = Seq.of(1,2,3).map(x => x * x).cacheResult();\n    squares.join() + squares.join();\n\nUse this method judiciously, as it must fully evaluate a Seq.\n\nNote: after calling `cacheResult()`, a Seq will always have a size."}}}}]}},"KeyedSeq":{"module":{},"call":{"signatures":[{"typeParams":["K","V"],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1123},{"typeParams":["K","V"],"params":[{"name":"seq","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1129},{"typeParams":["K","V"],"params":[{"name":"seq","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1130},{"typeParams":["K","V"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":0}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1131},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":3},{"k":7,"param":"V"}]},"line":1132},{"typeParams":["K","V"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":0}]}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1133},{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1134}],"doc":{"synopsis":"Always returns a KeyedSeq, if input is not keyed, expects an\niterable of [K, V] tuples."}},"interface":{"line":1135,"typeParams":["K","V"],"extends":[{"k":8,"name":"Seq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1137}],"doc":{"synopsis":"Returns itself"}}}}]}},"IndexedSeq":{"module":{"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1146}],"doc":{"synopsis":"Provides an IndexedSeq of the values provided."}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1152},{"typeParams":["T"],"params":[{"name":"seq","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1158},{"typeParams":["T"],"params":[{"name":"seq","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1159},{"typeParams":["K","V"],"params":[{"name":"seq","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":0}]},"line":1160},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1161},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1162},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1163}],"doc":{"synopsis":"Always returns IndexedSeq, discarding associated keys and\nsupplying incrementing indices."}},"interface":{"line":1164,"typeParams":["T"],"extends":[{"k":8,"name":"Seq","args":[{"k":2},{"k":7,"param":"T"}]},{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1166}],"doc":{"synopsis":"Returns itself"}}}}]}},"SetSeq":{"module":{"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1174}],"doc":{"synopsis":"Returns a SetSeq of the provided values"}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1180},{"typeParams":["T"],"params":[{"name":"seq","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1185},{"typeParams":["T"],"params":[{"name":"seq","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1186},{"typeParams":["K","V"],"params":[{"name":"seq","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"SetSeq","args":[{"k":0}]},"line":1187},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1188},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1189},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1190}],"doc":{"synopsis":"Always returns a SetSeq, discarding associated indices or keys."}},"interface":{"line":1191,"typeParams":["T"],"extends":[{"k":8,"name":"Seq","args":[{"k":7,"param":"T"},{"k":7,"param":"T"}]},{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1193}],"doc":{"synopsis":"Returns itself"}}}}]}},"Range":{"call":{"signatures":[{"params":[{"name":"start","optional":true,"type":{"k":2}},{"name":"end","optional":true,"type":{"k":2}},{"name":"step","optional":true,"type":{"k":2}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":2}]},"line":1199}],"doc":{"synopsis":"Returns a IndexedSeq of numbers from `start` (inclusive) to `end`\n(exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to\ninfinity. When `start` is equal to `end`, returns empty range.","description":"    Range() // [0,1,2,3,...]\n    Range(10) // [10,11,12,13,...]\n    Range(10,15) // [10,11,12,13,14]\n    Range(10,30,5) // [10,15,20,25]\n    Range(30,10,5) // [30,25,20,15]\n    Range(30,30,5) // []\n"}}},"Repeat":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"value","type":{"k":7,"param":"T"}},{"name":"times","optional":true,"type":{"k":2}}],"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1215}],"doc":{"synopsis":"Returns a IndexedSeq of `value` repeated `times` times. When `times` is\nnot defined, returns an infinite sequence of `value`.","description":"    Repeat('foo') // ['foo','foo','foo',...]\n    Repeat('bar',4) // ['bar','bar','bar','bar']\n"}}},"Collection":{"interface":{"line":1226,"doc":{"synopsis":"Collections are concrete data structures."},"typeParams":["K","V"],"extends":[{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"properties":{"#size":{"line":1232,"doc":{"synopsis":"All collections maintain their current `size` as an integer."},"type":{"k":2}}}}]}},"KeyedCollection":{"interface":{"line":1238,"doc":{"synopsis":"Collections which represent key value pairs."},"typeParams":["K","V"],"extends":[{"k":8,"name":"Collection","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"KeyedSeq","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1243}],"doc":{"synopsis":"Returns KeyedSeq."}}}}]}},"IndexedCollection":{"interface":{"line":1250,"doc":{"synopsis":"Collections which represent ordered indexed values."},"typeParams":["T"],"extends":[{"k":8,"name":"Collection","args":[{"k":2},{"k":7,"param":"T"}]},{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"IndexedSeq","args":[{"k":7,"param":"T"}]},"line":1255}],"doc":{"synopsis":"Returns IndexedSeq."}}}}]}},"SetCollection":{"interface":{"line":1262,"doc":{"synopsis":"Collections which represent only values, unassociated with keys or indices."},"typeParams":["T"],"extends":[{"k":8,"name":"Collection","args":[{"k":7,"param":"T"},{"k":7,"param":"T"}]},{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}],"groups":[{"methods":{"#toSeq":{"signatures":[{"type":{"k":8,"name":"SetSeq","args":[{"k":7,"param":"T"}]},"line":1267}],"doc":{"synopsis":"Returns SetSeq."}}}}]}},"Map":{"doc":{"synopsis":"Immutable Map is an unordered KeyedIterable of (key, value) pairs with\n`O(log32 N)` gets and `O(log32 N)` persistent sets.","description":"Iteration order of a Map is undefined, however is stable. Multiple\niterations of the same Map will iterate in the same order.\n\nMap's keys can be of any type, and use `Immutable.is` to determine key\nequality. This allows the use of any value (including NaN) as a key.\n\nBecause `Immutable.is` returns equality based on value semantics, and\nImmutable collections are treated as values, any Immutable collection may\nbe used as a key.\n\n    Map().set(List.of(1), 'listofone').get(List.of(1));\n    // 'listofone'\n\nAny JavaScript object may be used as a key, however strict identity is used\nto evaluate key equality. Two similar looking objects will represent two\ndifferent keys.\n\nImplemented by a hash-array mapped trie."},"module":{"isMap":{"call":{"signatures":[{"params":[{"name":"maybeMap","type":{"k":0}}],"type":{"k":1},"line":1300}],"doc":{"synopsis":"True if the provided value is a Map"}}}},"call":{"signatures":[{"typeParams":["K","V"],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1306},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1318},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1319},{"typeParams":["K","V"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1320},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1321},{"typeParams":["K","V"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1322},{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1323}],"doc":{"synopsis":"Creates a new Immutable Map.","description":"Created with the same key value pairs as the provided KeyedIterable or\nJavaScript Object or expects an Iterable of [K, V] tuple entries.\n\n    var newMap = Map({key: \"value\"});\n    var newMap = Map([[\"key\", \"value\"]]);\n"}},"interface":{"line":1324,"typeParams":["K","V"],"extends":[{"k":8,"name":"KeyedCollection","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}],"groups":[{"title":"Persistent changes","methods":{"#set":{"signatures":[{"params":[{"name":"key","type":{"k":7,"param":"K"}},{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1327}],"doc":{"synopsis":"Returns a new Map also containing the new key, value pair. If an equivalent\nkey already exists in this Map, it will be replaced."}},"#remove":{"signatures":[{"params":[{"name":"key","type":{"k":7,"param":"K"}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1335}],"doc":{"synopsis":"Returns a new Map which excludes this `key`.","notes":[{"name":"alias","body":"delete"}],"description":"Note: `delete` cannot be safely used in IE8, but is provided to mirror\nthe ES6 collection API."}},"#clear":{"signatures":[{"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1345}],"doc":{"synopsis":"Returns a new Map containing no keys or values."}},"#update":{"signatures":[{"params":[{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1350},{"params":[{"name":"key","type":{"k":7,"param":"K"}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1360},{"params":[{"name":"key","type":{"k":7,"param":"K"}},{"name":"notSetValue","type":{"k":7,"param":"V"}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1361}],"doc":{"synopsis":"Returns a new Map having updated the value at this `key` with the return\nvalue of calling `updater` with the existing value, or `notSetValue` if\nthe key was not set. If called with only a single argument, `updater` is\ncalled with the Map itself.","description":"Equivalent to: `map.set(key, updater(map.get(key, notSetValue)))`."}},"#merge":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1362},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1381}],"doc":{"synopsis":"Returns a new Map resulting from merging the provided Iterables\n(or JS objects) into this Map. In other words, this takes each entry of\neach iterable and sets it on this Map.","description":"If any of the values provided to `merge` are not Iterable (would return\nfalse for `Immutable.isIterable`) then they are deeply converted via\n`Immutable.fromJS` before being merged. However, if the value is an\nIterable but contains non-iterable JS objects or arrays, those nested\nvalues will be preserved.\n\n    var x = Immutable.Map({a: 10, b: 20, c: 30});\n    var y = Immutable.Map({b: 40, a: 50, d: 60});\n    x.merge(y) // { a: 50, b: 40, c: 30, d: 60 }\n    y.merge(x) // { b: 20, a: 10, d: 60, c: 30 }\n"}},"#mergeWith":{"signatures":[{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"V"}},{"name":"next","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1382},{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"V"}},{"name":"next","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1398}],"doc":{"synopsis":"Like `merge()`, `mergeWith()` returns a new Map resulting from merging\nthe provided Iterables (or JS objects) into this Map, but uses the\n`merger` function for dealing with conflicts.","description":"    var x = Immutable.Map({a: 10, b: 20, c: 30});\n    var y = Immutable.Map({b: 40, a: 50, d: 60});\n    x.mergeWith((prev, next) => prev / next, y) // { a: 0.2, b: 0.5, c: 30, d: 60 }\n    y.mergeWith((prev, next) => prev / next, x) // { b: 2, a: 5, d: 60, c: 30 }\n"}},"#mergeDeep":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1402},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1413}],"doc":{"synopsis":"Like `merge()`, but when two Iterables conflict, it merges them as well,\nrecursing deeply through the nested data.","description":"    var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });\n    var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });\n    x.mergeDeep(y) // {a: { x: 2, y: 10 }, b: { x: 20, y: 5 }, c: { z: 3 } }\n"}},"#mergeDeepWith":{"signatures":[{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"V"}},{"name":"next","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1414},{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"V"}},{"name":"next","optional":true,"type":{"k":7,"param":"V"}}],"type":{"k":7,"param":"V"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1429}],"doc":{"synopsis":"Like `mergeDeep()`, but when two non-Iterables conflict, it uses the\n`merger` function to determine the resulting value.","description":"    var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });\n    var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });\n    x.mergeDeepWith((prev, next) => prev / next, y)\n    // {a: { x: 5, y: 10 }, b: { x: 20, y: 10 }, c: { z: 3 } }\n"}}}},{"title":"Deep persistent changes","methods":{"#setIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1433},{"params":[{"name":"KeyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"value","type":{"k":7,"param":"V"}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1442}],"doc":{"synopsis":"Returns a new Map having set `value` at this `keyPath`. If any keys in\n`keyPath` do not exist, a new immutable Map will be created at that key."}},"#removeIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1443},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1450}],"doc":{"synopsis":"Returns a new Map having removed the value at this `keyPath`. If any keys\nin `keyPath` do not exist, a new immutable Map will be created at\nthat key."}},"#updateIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1451},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"notSetValue","type":{"k":0}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1467},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1472},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"notSetValue","type":{"k":0}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1476}],"doc":{"synopsis":"Returns a new Map having applied the `updater` to the entry found at the\nkeyPath. If any keys in `keyPath` do not exist, a new immutable Map will\nbe created at that key. If the `keyPath` was not previously set,\n`updater` is called with `notSetValue` (if provided).","description":"    var data = Immutable.fromJS({ a: { b: { c: 10 } } });\n    data.updateIn(['a', 'b'], map => map.set('d', 20));\n    // { a: { b: { c: 10, d: 20 } } }\n"}},"#mergeIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1481},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1495},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1499}],"doc":{"synopsis":"A combination of `updateIn` and `merge`, returning a new Map, but\nperforming the merge at a point arrived at by following the keyPath.\nIn other words, these two lines are equivalent:","description":"    x.updateIn(['a', 'b', 'c'], abc => abc.merge(y));\n    x.mergeIn(['a', 'b', 'c'], y);\n"}},"#mergeDeepIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1503},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1517},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}}],"type":{"k":8,"name":"Map","args":[{"k":3},{"k":7,"param":"V"}]},"line":1521}],"doc":{"synopsis":"A combination of `updateIn` and `mergeDeep`, returning a new Map, but\nperforming the deep merge at a point arrived at by following the keyPath.\nIn other words, these two lines are equivalent:","description":"    x.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y));\n    x.mergeDeepIn(['a', 'b', 'c'], y);\n"}}}},{"title":"Transient updates","methods":{"#withMutations":{"signatures":[{"params":[{"name":"mutator","type":{"k":6,"params":[{"name":"mutable","type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":0}}}],"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1525}],"doc":{"synopsis":"Every time you call one of the above functions, a new immutable Map is\ncreated. If a pure function calls a number of these to produce a final\nreturn value, then a penalty on performance and memory has been paid by\ncreating all of the intermediate immutable Maps.","description":"If you need to apply a series of mutations to produce a new immutable\nMap, `withMutations()` creates a temporary mutable copy of the Map which\ncan apply mutations in a highly performant manner. In fact, this is\nexactly how complex mutations like `merge` are done.\n\nAs an example, this results in the creation of 2, not 4, new Maps:\n\n    var map1 = Immutable.Map();\n    var map2 = map1.withMutations(map => {\n      map.set('a', 1).set('b', 2).set('c', 3);\n    });\n    assert(map1.size === 0);\n    assert(map2.size === 3);\n"}},"#asMutable":{"signatures":[{"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1551}],"doc":{"synopsis":"Another way to avoid creation of intermediate Immutable maps is to create\na mutable copy of this collection. Mutable copies *always* return `this`,\nand thus shouldn't be used for equality. Your function should never return\na mutable copy of a collection, only use it internally to create a new\ncollection. If possible, use `withMutations` as it provides an easier to\nuse API.","description":"Note: if the collection is already mutable, `asMutable` returns itself."}},"#asImmutable":{"signatures":[{"type":{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1563}],"doc":{"synopsis":"The yin to `asMutable`'s yang. Because it applies to mutable collections,\nthis operation is *mutable* and returns itself. Once performed, the mutable\ncopy has become immutable and can be safely returned from a function."}}}}]}},"OrderedMap":{"doc":{"synopsis":"A type of Map that has the additional guarantee that the iteration order of\nentries will be the order in which they were set().","description":"The iteration behavior of OrderedMap is the same as native ES6 Map and\nJavaScript Object.\n\nNote that `OrderedMap` are more expensive than non-ordered `Map` and may\nconsume more memory. `OrderedMap#set` is amoratized O(log32 N), but not\nstable."},"module":{"isOrderedMap":{"call":{"signatures":[{"params":[{"name":"maybeOrderedMap","type":{"k":0}}],"type":{"k":1},"line":1586}],"doc":{"synopsis":"True if the provided value is an OrderedMap."}}}},"call":{"signatures":[{"typeParams":["K","V"],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1592},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1607},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1608},{"typeParams":["K","V"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1609},{"typeParams":["V"],"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":7,"param":"V"}}]}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":3},{"k":7,"param":"V"}]},"line":1610},{"typeParams":["K","V"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":8,"name":"Array","args":[{"k":0}]}]}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1611},{"typeParams":["K","V"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"OrderedMap","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]},"line":1612}],"doc":{"synopsis":"Creates a new Immutable OrderedMap.","description":"Created with the same key value pairs as the provided KeyedIterable or\nJavaScript Object or expects an Iterable of [K, V] tuple entries.\n\nThe iteration order of key-value pairs provided to this constructor will\nbe preserved in the OrderedMap.\n\n    var newOrderedMap = OrderedMap({key: \"value\"});\n    var newOrderedMap = OrderedMap([[\"key\", \"value\"]]);\n"}},"interface":{"line":1613,"typeParams":["K","V"],"extends":[{"k":8,"name":"Map","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}]}},"Record":{"doc":{"synopsis":"Creates a new Class which produces Record instances. A record is similar to\na JS object, but enforce a specific set of allowed string keys, and have\ndefault values.","description":"    var ABRecord = Record({a:1, b:2})\n    var myRecord = new ABRecord({b:3})\n\nRecords always have a value for the keys they define. `remove`ing a key\nfrom a record simply resets it to the default value for that key.\n\n    myRecord.size // 2\n    myRecord.get('a') // 1\n    myRecord.get('b') // 3\n    myRecordWithoutB = myRecord.remove('b')\n    myRecordWithoutB.get('b') // 2\n    myRecordWithoutB.size // 2\n\nValues provided to the constructor not found in the Record type will\nbe ignored:\n\n    var myRecord = new ABRecord({b:3, x:10})\n    myRecord.get('x') // undefined\n\nBecause Records have a known set of string keys, property get access works\nas expected, however property sets will throw an Error.\n\nNote: IE8 does not support property access. Only use `get()` when\nsupporting IE8.\n\n    myRecord.b // 3\n    myRecord.b = 5 // throws Error\n\nRecord Classes can be extended as well, allowing for custom methods on your\nRecord. This is not a common pattern in functional environments, but is in\nmany JS programs.\n\nNote: TypeScript does not support this type of subclassing.\n\n    class ABRecord extends Record({a:1,b:2}) {\n      getAB() {\n        return this.a + this.b;\n      }\n    }\n\n    var myRecord = new ABRecord(b:3)\n    myRecord.getAB() // 4\n"},"module":{"Class":{"interface":{"line":1668}}},"call":{"signatures":[{"params":[{"name":"defaultValues","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":0}}]}},{"name":"name","optional":true,"type":{"k":3}}],"type":{"k":8,"name":"Class","qualifier":["Record"]},"line":1674}]}},"Set":{"doc":{"synopsis":"A Collection of unique values with `O(log32 N)` adds and has.","description":"When iterating a Set, the entries will be (value, value) pairs. Iteration\norder of a Set is undefined, however is stable. Multiple iterations of the\nsame Set will iterate in the same order.\n\nSet values, like Map keys, may be of any type. Equality is determined using\n`Immutable.is`, enabling Sets to uniquely include other Immutable\ncollections, custom value types, and NaN."},"module":{"isSet":{"call":{"signatures":[{"params":[{"name":"maybeSet","type":{"k":0}}],"type":{"k":1},"line":1693}],"doc":{"synopsis":"True if the provided value is a Set"}}},"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1698}],"doc":{"synopsis":"Creates a new Set containing `values`."}}},"fromKeys":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"T"},{"k":0}]}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1703},{"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":0}}]}}],"type":{"k":8,"name":"Set","args":[{"k":3}]},"line":1709}],"doc":{"synopsis":"`Set.fromKeys()` creates a new immutable Set containing the keys from\nthis Iterable or JavaScript Object."}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1711},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1717},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1718},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Set","args":[{"k":0}]},"line":1719},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1720},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1721},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1722}],"doc":{"synopsis":"Create a new immutable Set containing the values of the provided\niterable-like."}},"interface":{"line":1723,"typeParams":["T"],"extends":[{"k":8,"name":"SetCollection","args":[{"k":7,"param":"T"}]}],"groups":[{"title":"Persistent changes","methods":{"#add":{"signatures":[{"params":[{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1726}],"doc":{"synopsis":"Returns a new Set which also includes this value."}},"#remove":{"signatures":[{"params":[{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1733}],"doc":{"synopsis":"Returns a new Set which excludes this value.","notes":[{"name":"alias","body":"delete"}],"description":"Note: `delete` cannot be safely used in IE8"}},"#clear":{"signatures":[{"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1742}],"doc":{"synopsis":"Returns a new Set containing no values."}},"#merge":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1747},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1753}],"doc":{"synopsis":"Alias for `union`.","notes":[{"name":"see","body":"`Map.prototype.merge`"}]}},"#union":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1754},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1760}],"doc":{"synopsis":"Returns a Set including any value from `iterables` that does not already\nexist in this Set."}},"#intersect":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1761},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1767}],"doc":{"synopsis":"Returns a Set which has removed any values not also contained\nwithin `iterables`."}},"#subtract":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1768},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1773}],"doc":{"synopsis":"Returns a Set excluding any values contained within `iterables`."}}}},{"title":"Transient changes","methods":{"#withMutations":{"signatures":[{"params":[{"name":"mutator","type":{"k":6,"params":[{"name":"mutable","type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]}}],"type":{"k":0}}}],"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1774}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.withMutations`"}]}},"#asMutable":{"signatures":[{"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1782}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asMutable`"}]}},"#asImmutable":{"signatures":[{"type":{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]},"line":1787}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asImmutable`"}]}}}}]}},"OrderedSet":{"doc":{"synopsis":"A type of Set that has the additional guarantee that the iteration order of\nvalues will be the order in which they were `add`ed.","description":"The iteration behavior of OrderedSet is the same as native ES6 Set.\n\nNote that `OrderedSet` are more expensive than non-ordered `Set` and may\nconsume more memory. `OrderedSet#add` is amoratized O(log32 N), but not\nstable."},"module":{"isOrderedSet":{"call":{"signatures":[{"params":[{"name":"maybeOrderedSet","type":{"k":0}}],"type":{"k":1},"line":1806}],"doc":{"synopsis":"True if the provided value is an OrderedSet."}}},"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1811}],"doc":{"synopsis":"Creates a new OrderedSet containing `values`."}}},"fromKeys":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":7,"param":"T"},{"k":0}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1816},{"params":[{"name":"obj","type":{"k":4,"members":[{"index":true,"params":[{"name":"key","type":{"k":3}}],"type":{"k":0}}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":3}]},"line":1822}],"doc":{"synopsis":"`OrderedSet.fromKeys()` creates a new immutable OrderedSet containing\nthe keys from this Iterable or JavaScript Object."}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1824},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1830},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1831},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":0}]},"line":1832},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1833},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1834},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"OrderedSet","args":[{"k":7,"param":"T"}]},"line":1835}],"doc":{"synopsis":"Create a new immutable OrderedSet containing the values of the provided\niterable-like."}},"interface":{"line":1836,"typeParams":["T"],"extends":[{"k":8,"name":"Set","args":[{"k":7,"param":"T"}]}]}},"List":{"doc":{"synopsis":"Lists are ordered indexed dense collections, much like a JavaScript\nArray.","description":"Lists are immutable and fully persistent with O(log32 N) gets and sets,\nand O(1) push and pop.\n\nLists implement Deque, with efficient addition and removal from both the\nend (`push`, `pop`) and beginning (`unshift`, `shift`).\n\nUnlike a JavaScript Array, there is no distinction between an\n\"unset\" index and an index set to `undefined`. `List#forEach` visits all\nindices from 0 to size, regardless of if they where explicitly defined."},"module":{"isList":{"call":{"signatures":[{"params":[{"name":"maybeList","type":{"k":0}}],"type":{"k":1},"line":1856}],"doc":{"synopsis":"True if the provided value is a List"}}},"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1861}],"doc":{"synopsis":"Creates a new List containing `values`."}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1867},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1873},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1874},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"List","args":[{"k":0}]},"line":1875},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1876},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1877},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1878}],"doc":{"synopsis":"Create a new immutable List containing the values of the provided\niterable-like."}},"interface":{"line":1879,"typeParams":["T"],"extends":[{"k":8,"name":"IndexedCollection","args":[{"k":7,"param":"T"}]}],"groups":[{"title":"Persistent changes","methods":{"#set":{"signatures":[{"params":[{"name":"index","type":{"k":2}},{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1882}],"doc":{"synopsis":"Returns a new List which includes `value` at `index`. If `index` already\nexists in this List, it will be replaced.","description":"`index` may be a negative number, which indexes back from the end of the\nList. `v.set(-1, \"value\")` sets the last item in the List.\n\nIf `index` larger than `size`, the returned List's `size` will be large\nenough to include the `index`."}},"#remove":{"signatures":[{"params":[{"name":"index","type":{"k":2}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1896}],"doc":{"synopsis":"Returns a new List which excludes this `index` and with a size 1 less\nthan this List. Values at indicies above `index` are shifted down by 1 to\nfill the position.","notes":[{"name":"alias","body":"delete"}],"description":"This is synonymous with `list.splice(index, 1)`.\n\n`index` may be a negative number, which indexes back from the end of the\nList. `v.delete(-1)` deletes the last item in the List.\n\nNote: `delete` cannot be safely used in IE8"}},"#clear":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1912}],"doc":{"synopsis":"Returns a new List with 0 size and no values."}},"#push":{"signatures":[{"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1917}],"doc":{"synopsis":"Returns a new List with the provided `values` appended, starting at this\nList's `size`."}},"#pop":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1923}],"doc":{"synopsis":"Returns a new List with a size ones less than this List, excluding\nthe last index in this List.","description":"Note: this differs from `Array.prototype.pop` because it returns a new\nList rather than the removed value. Use `last()` to get the last value\nin this List."}},"#unshift":{"signatures":[{"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1933}],"doc":{"synopsis":"Returns a new List with the provided `values` prepended, shifting other\nvalues ahead to higher indices."}},"#shift":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1939}],"doc":{"synopsis":"Returns a new List with a size ones less than this List, excluding\nthe first index in this List, shifting all other values to a lower index.","description":"Note: this differs from `Array.prototype.shift` because it returns a new\nList rather than the removed value. Use `first()` to get the first\nvalue in this List."}},"#update":{"signatures":[{"params":[{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1949},{"params":[{"name":"index","type":{"k":2}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1962},{"params":[{"name":"index","type":{"k":2}},{"name":"notSetValue","type":{"k":7,"param":"T"}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1963}],"doc":{"synopsis":"Returns a new List with an updated value at `index` with the return\nvalue of calling `updater` with the existing value, or `notSetValue` if\n`index` was not set. If called with a single argument, `updater` is\ncalled with the List itself.","notes":[{"name":"see","body":"Map.update"}],"description":"`index` may be a negative number, which indexes back from the end of the\nList. `v.update(-1)` updates the last item in the List.\n"}},"#merge":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1964},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1969}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.merge`"}]}},"#mergeWith":{"signatures":[{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"T"}},{"name":"next","optional":true,"type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1970},{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"T"}},{"name":"next","optional":true,"type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1978}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.mergeWith`"}]}},"#mergeDeep":{"signatures":[{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1982},{"params":[{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1987}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.mergeDeep`"}]}},"#mergeDeepWith":{"signatures":[{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"T"}},{"name":"next","optional":true,"type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1988},{"params":[{"name":"merger","type":{"k":6,"params":[{"name":"previous","optional":true,"type":{"k":7,"param":"T"}},{"name":"next","optional":true,"type":{"k":7,"param":"T"}}],"type":{"k":7,"param":"T"}}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":1996}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.mergeDeepWith`"}]}},"#setSize":{"signatures":[{"params":[{"name":"size","type":{"k":2}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2000}],"doc":{"synopsis":"Returns a new List with size `size`. If `size` is less than this\nList's size, the new List will exclude values at the higher indices.\nIf `size` is greater than this List's size, the new List will have\nundefined values for the newly available indices.","description":"When building a new List and the final size is known up front, `setSize`\nused in conjunction with `withMutations` may result in the more\nperformant construction."}}}},{"title":"Deep persistent changes","methods":{"#setIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2012},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"value","type":{"k":7,"param":"T"}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2024}],"doc":{"synopsis":"Returns a new List having set `value` at this `keyPath`. If any keys in\n`keyPath` do not exist, a new immutable Map will be created at that key.","description":"Index numbers are used as keys to determine the path to follow in\nthe List."}},"#removeIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2025},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2032}],"doc":{"synopsis":"Returns a new List having removed the value at this `keyPath`. If any\nkeys in `keyPath` do not exist, a new immutable Map will be created at\nthat key."}},"#updateIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2033},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"notSetValue","type":{"k":0}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2041},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2046},{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"notSetValue","type":{"k":0}},{"name":"updater","type":{"k":6,"params":[{"name":"value","type":{"k":0}}],"type":{"k":0}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2050}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.updateIn`"}]}},"#mergeIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2055},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2063},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2067}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.mergeIn`"}]}},"#mergeDeepIn":{"signatures":[{"params":[{"name":"keyPath","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2071},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2079},{"params":[{"name":"keyPath","type":{"k":8,"name":"Array","args":[{"k":0}]}},{"name":"iterables","varArgs":true,"type":{"k":5,"type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2083}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.mergeDeepIn`"}]}}}},{"title":"Transient changes","methods":{"#withMutations":{"signatures":[{"params":[{"name":"mutator","type":{"k":6,"params":[{"name":"mutable","type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]}}],"type":{"k":0}}}],"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2087}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.withMutations`"}]}},"#asMutable":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2095}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asMutable`"}]}},"#asImmutable":{"signatures":[{"type":{"k":8,"name":"List","args":[{"k":7,"param":"T"}]},"line":2100}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asImmutable`"}]}}}}]}},"Stack":{"doc":{"synopsis":"Stacks are indexed collections which support very efficient O(1) addition\nand removal from the front using `unshift(v)` and `shift()`.","description":"For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but\nbe aware that they also operate on the front of the list, unlike List or\na JavaScript Array.\n\nNote: `reverse()` or any inherent reverse traversal (`reduceRight`,\n`lastIndexOf`, etc.) is not efficient with a Stack.\n\nStack is implemented with a Single-Linked List."},"module":{"isStack":{"call":{"signatures":[{"params":[{"name":"maybeStack","type":{"k":0}}],"type":{"k":1},"line":2122}],"doc":{"synopsis":"True if the provided value is a Stack"}}},"of":{"call":{"signatures":[{"typeParams":["T"],"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2127}],"doc":{"synopsis":"Creates a new Stack containing `values`."}}}},"call":{"signatures":[{"typeParams":["T"],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2133},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"IndexedIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2142},{"typeParams":["T"],"params":[{"name":"iter","type":{"k":8,"name":"SetIterable","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2143},{"typeParams":["K","V"],"params":[{"name":"iter","type":{"k":8,"name":"KeyedIterable","args":[{"k":7,"param":"K"},{"k":7,"param":"V"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":0}]},"line":2144},{"typeParams":["T"],"params":[{"name":"array","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2145},{"typeParams":["T"],"params":[{"name":"iterator","type":{"k":8,"name":"Iterator","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2146},{"typeParams":["T"],"params":[{"name":"iterable","type":{"k":8,"name":"Object"}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2147}],"doc":{"synopsis":"Create a new immutable Stack containing the values of the provided\niterable-like.","description":"The iteration order of the provided iterable is preserved in the\nresulting `Stack`."}},"interface":{"line":2148,"typeParams":["T"],"extends":[{"k":8,"name":"IndexedCollection","args":[{"k":7,"param":"T"}]}],"groups":[{"title":"Reading values","methods":{"#peek":{"signatures":[{"type":{"k":7,"param":"T"},"line":2151}],"doc":{"synopsis":"Alias for `Stack.first()`."}}}},{"title":"Persistent changes","methods":{"#clear":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2158}],"doc":{"synopsis":"Returns a new Stack with 0 size and no values."}},"#unshift":{"signatures":[{"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2166}],"doc":{"synopsis":"Returns a new Stack with the provided `values` prepended, shifting other\nvalues ahead to higher indices.","description":"This is very efficient for Stack."}},"#unshiftAll":{"signatures":[{"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2174},{"params":[{"name":"iter","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2179}],"doc":{"synopsis":"Like `Stack#unshift`, but accepts a iterable rather than varargs."}},"#shift":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2180}],"doc":{"synopsis":"Returns a new Stack with a size ones less than this Stack, excluding\nthe first item in this Stack, shifting all other values to a lower index.","description":"Note: this differs from `Array.prototype.shift` because it returns a new\nStack rather than the removed value. Use `first()` or `peek()` to get the\nfirst value in this Stack."}},"#push":{"signatures":[{"params":[{"name":"values","varArgs":true,"type":{"k":5,"type":{"k":7,"param":"T"}}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2190}],"doc":{"synopsis":"Alias for `Stack#unshift` and is not equivalent to `List#push`."}},"#pushAll":{"signatures":[{"params":[{"name":"iter","type":{"k":8,"name":"Iterable","args":[{"k":0},{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2195},{"params":[{"name":"iter","type":{"k":8,"name":"Array","args":[{"k":7,"param":"T"}]}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2200}],"doc":{"synopsis":"Alias for `Stack#unshiftAll`."}},"#pop":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2201}],"doc":{"synopsis":"Alias for `Stack#shift` and is not equivalent to `List#pop`."}}}},{"title":"Transient changes","methods":{"#withMutations":{"signatures":[{"params":[{"name":"mutator","type":{"k":6,"params":[{"name":"mutable","type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]}}],"type":{"k":0}}}],"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2206}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.withMutations`"}]}},"#asMutable":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2214}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asMutable`"}]}},"#asImmutable":{"signatures":[{"type":{"k":8,"name":"Stack","args":[{"k":7,"param":"T"}]},"line":2219}],"doc":{"synopsis":"","notes":[{"name":"see","body":"`Map.prototype.asImmutable`"}]}}}}]}}}}}
},{}],63:[function(require,module,exports){
var TypeKind = {
  Any: 0,

  Boolean: 1,
  Number: 2,
  String: 3,
  Object: 4,
  Array: 5,
  Function: 6,

  Param: 7,
  Type: 8,
};

module.exports = TypeKind;

},{}],"immutable":[function(require,module,exports){
(function (global){
module.exports = global.Immutable;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"react":[function(require,module,exports){
(function (global){
module.exports = global.React;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},["./src/index.js"])


//# sourceMappingURL=maps/bundle.js.map