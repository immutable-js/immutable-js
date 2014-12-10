var React = require('react');
var { TransitionGroup } = React.addons;
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');
var Router = require('react-router');
var { CallSigDef, MemberDef } = require('./Defs');
var PageDataMixin = require('./PageDataMixin');
var isMobile = require('./isMobile');
var MarkDown = require('./MarkDown');


var MemberDoc = React.createClass({
  mixins: [ PageDataMixin, Router.Navigation ],

  getInitialState: function() {
    var showDetail = this.props.showDetail;
    return { detail: showDetail };
  },

  componentDidMount: function() {
    if (this.props.showDetail) {
      var node = this.getDOMNode();
      var navType = this.getPageData().type;
      if (navType === 'init' || navType === 'push') {
        window.scrollTo(
          window.scrollX,
          offsetTop(node) - FIXED_HEADER_HEIGHT
        );
      }
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.showDetail && !this.props.showDetail) {
      this.scrollTo = true;
      this.setState({ detail: true });
    }
  },

  componentDidUpdate: function() {
    if (this.scrollTo) {
      this.scrollTo = false;
      var node = this.getDOMNode();
      var navType = this.getPageData().type;
      if (navType === 'init' || navType === 'push') {
        window.scrollTo(
          window.scrollX,
          offsetTop(node) - FIXED_HEADER_HEIGHT
        );
      }
    }
  },

  toggleDetail: function() {
    // Note: removed this because it drops the URL bar on mobile, and that's
    // the only place it's currently being used.
    // var member = this.props.member;
    // var name = member.memberName;
    // var typeName = this.props.parentName;
    // var showDetail = this.props.showDetail;
    // if (!this.state.detail) {
    //   this.replaceWith('/' + (typeName ? typeName + '/' : '') + name );
    // } else if (this.state.detail && showDetail) {
    //   this.replaceWith('/' + (typeName || '') );
    // }
    this.setState({ detail: !this.state.detail });
  },

  render: function() {
    var typePropMap = this.props.typePropMap;
    var member = this.props.member;
    var module = member.isStatic ? this.props.parentName : null;
    var name = member.memberName;
    var def = member.memberDef;
    var doc = def.doc || {};
    var isProp = !def.signatures;

    var typeInfo = member.inherited && {
      propMap: typePropMap,
      defining: member.inherited.name
    };

    var showDetail = isMobile ? this.state.detail : true;

    return (
      <div className="interfaceMember">
        <h3 onClick={isMobile ? this.toggleDetail : null} className="memberLabel">
          {(module ? module + '.' : '') + name + (isProp ? '' : '()')}
        </h3>
        <TransitionGroup childFactory={makeSlideDown}>
          {showDetail &&
            <div key="detail" className="detail">
              {doc.synopsis && <MarkDown className="synopsis" contents={doc.synopsis} />}
              {isProp ?
                <code className="codeBlock memberSignature">
                  <MemberDef module={module} member={{name, type: def.type}} />
                </code> :
                <code className="codeBlock memberSignature">
                {def.signatures.map((callSig, i) =>
                  [<CallSigDef
                    info={typeInfo}
                    module={module}
                    name={name}
                    callSig={callSig}
                  />, '\n']
                )}</code>
              }
              {member.inherited &&
                <section>
                  <h4 className="infoHeader">
                    Inherited from
                  </h4>
                  <Router.Link to={'/' + member.inherited.name + '/' + name}>
                    {member.inherited.name + '#' + name}
                  </Router.Link>
                </section>
              }
              {member.overrides &&
                <section>
                  <h4 className="infoHeader">
                    Overrides
                  </h4>
                  <Router.Link to={'/' + member.overrides.name + '/' + name}>
                    {member.overrides.name + '#' + name}
                  </Router.Link>
                </section>
              }
              {doc.notes && doc.notes.map((note, i) =>
                <section key={i}>
                  <h4 className="infoHeader">
                    {note.name}
                  </h4>
                  {
                    note.name === 'alias' ?
                      <code><CallSigDef name={note.body} /></code> :
                      <MarkDown className="discussion" contents={note.body} />
                  }
                </section>
              )}
              {doc.description &&
                <section>
                  <h4 className="infoHeader">
                    {doc.description.substr(0, 5) === '<code' ?
                      'Example' :
                      'Discussion'}
                  </h4>
                  <MarkDown className="discussion" contents={doc.description} />
                </section>
              }
            </div>
          }
        </TransitionGroup>
      </div>
    );
  }
});


function makeSlideDown(child) {
  return <SlideDown>{child}</SlideDown>
}

var SlideDown = React.createClass({
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
    var endListener = event => {
      ReactTransitionEvents.removeEndEventListener(node, endListener);
      done();
    };
    ReactTransitionEvents.addEndEventListener(node, endListener);
    this.timeout = setTimeout(() => {
      node.style.height = end;
    }, 17);
  },

  render: function() {
    return this.props.children;
  }
});

var FIXED_HEADER_HEIGHT = 64;

function offsetTop(node) {
  var top = 0;
  do {
    top += node.offsetTop;
  } while ((node = node.offsetParent));
  return top;
}

module.exports = MemberDoc;
