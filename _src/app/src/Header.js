var React = require('react');
var SVGSet = require('./SVGSet');
var Logo = require('./Logo');
var StarBtn = require('./StarBtn');


var fixed = window.matchMedia && window.matchMedia('(max-device-width: 680px)');
fixed = fixed && fixed.matches;

var Header = React.createClass({

  getInitialState: function() {
    return { scroll: 0 };
  },

  componentDidMount: function () {
    this.offsetHeight = this.getDOMNode().offsetHeight;
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function () {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  },

  handleResize: function (event) {
    this.offsetHeight = this.getDOMNode().offsetHeight;
  },

  handleScroll: function (event) {
    var scrollPos = window.scrollY;
    if (scrollPos < this.offsetHeight) {
      this.setState({ scroll: scrollPos });
    }
  },

  render: function() {
    var neg = this.state.scroll < 0;
    var s = neg ? 0 : this.state.scroll;
    var sp = fixed ? 35 : 70;

    return (
      <div className="header">
        <div className="miniHeader">
          <div className="miniHeaderContents">
            <a href="https://github.com/facebook/immutable-js/blob/master/type-definitions/Immutable.d.ts">Documentation</a>
            <a href="https://github.com/facebook/immutable-js/issues/">Support</a>
            <a href="https://github.com/facebook/immutable-js/">Github</a>
          </div>
        </div>
        <div className="cover">
        <div className={"coverFixed" + (fixed ? ' fixed' : '')} style={fixed ? {}: t(s, 1)}>
          <div className="filler">
            <div className="miniHeaderContents">
              <a href="https://github.com/facebook/immutable-js/blob/master/type-definitions/Immutable.d.ts">Documentation</a>
              <a href="https://github.com/facebook/immutable-js/issues/">Support</a>
              <a href="https://github.com/facebook/immutable-js/">Github</a>
            </div>
          </div>
          <div className="synopsis" >
            <div className="logo">
              {(fixed ? [0,0,0,0,0,0,0] : [0,0,0,0,0,0,0,0,0,0,0,0]).map((_, i) =>
                <SVGSet key={i} style={t(y(s, i * sp), z(s, i * sp))}>
                  <Logo color="#d7dadb" />
                  <Logo color="#6dbcdb" opacity={o(s, i * sp)} />
                </SVGSet>
              )}
              <SVGSet style={t(s * -0.55, 1)}>
                <Logo color="#FC4349" />
                <Logo color="#2C3E50" inline={true} />
              </SVGSet>
            </div>
          </div>
          <div className="buttons">
            <StarBtn />
          </div>
        </div>
        </div>
      </div>
    );
  }
});


function y(s, p) {
  return ((p < s ? p : s) * -0.55);
}

function o(s, p) {
  return Math.max(0, s > p ? 1 - (s - p)/350 : 1);
}

function z(s, p) {
  return Math.max(0, s > p ? 1 - (s - p)/20000 : 1);
}

function t(y, z) {
  var transform = 'translate3d(0, '+y+'px, 0) scale('+z+')';
  return {
    transform: transform,
    WebkitTransform: transform,
    MozTransform: transform,
    msTransform: transform,
    OTransform: transform,
  };
}


module.exports = Header;
