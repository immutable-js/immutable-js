var React = require('react');
var { classSet, TransitionGroup } = React.addons;
var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');
var Router = require('react-router');
var { CallSigDef, MemberDef } = require('./Defs');
var PageDataMixin = require('./PageDataMixin');


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
      <div className="interfaceMember">
        <div onClick={this.toggleDetail} className={className}>
          {isProp ?
            <MemberDef module={module} member={{name}} /> :
            <CallSigDef module={module} name={name} />}
          {member.inherited && <span className="inherited">inherited</span>}
          {member.overrides && <span className="override">override</span>}
        </div>
        <TransitionGroup childFactory={makeSlideDown}>
          {this.state.detail &&
            <div key="detail" className="detail">
              {doc.synopsis && <pre>{doc.synopsis}</pre>}
              <h4 className="infoHeader">
                {'Definition' + (def.signatures && def.signatures.length !== 1 ? 's' : '')}
              </h4>
              {isProp ?
                <div className="codeBlock memberSignature">
                  <MemberDef module={module} member={{name, type: def.type}} />
                </div> :
                def.signatures.map((callSig, i) =>
                  <div key={i} className="codeBlock memberSignature">
                    <CallSigDef module={module} name={name} callSig={callSig} />
                  </div>
                )
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
                      <CallSigDef name={note.body} /> :
                    note.body
                  }
                </section>
              )}
              {doc.description &&
                <section>
                  <h4 className="infoHeader">
                    Discussion
                  </h4>
                  <pre>{doc.description}</pre>
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
