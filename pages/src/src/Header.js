/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var SVGSet = require('./SVGSet');
var Logo = require('./Logo');
var StarBtn = require('./StarBtn');
var packageJson = require('../../../package.json');

var isMobileMatch =
  window.matchMedia && window.matchMedia('(max-device-width: 680px)');
var isMobile = isMobileMatch && isMobileMatch.matches;

var Header = React.createClass({
  getInitialState: function() {
    return { scroll: 0 };
  },

  componentDidMount: function() {
    this.offsetHeight = this.getDOMNode().offsetHeight;
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  },

  handleResize: function() {
    this.offsetHeight = this.getDOMNode().offsetHeight;
  },

  handleScroll: function() {
    if (!this._pending) {
      var headerHeight = Math.min(
        800,
        Math.max(260, document.documentElement.clientHeight * 0.7)
      );
      if (window.scrollY < headerHeight) {
        this._pending = true;
        window.requestAnimationFrame(() => {
          this._pending = false;
          this.setState({ scroll: window.scrollY });
        });
      }
    }
  },

  render: function() {
    var neg = this.state.scroll < 0;
    var s = neg ? 0 : this.state.scroll;
    var sp = isMobile ? 35 : 70;

    return (
      <div className="header">
        <div className="miniHeader">
          <div className="miniHeaderContents">
            <a href="./" target="_self" className="miniLogo">
              <SVGSet>
                <Logo color="#FC4349" />
                <Logo color="#2C3E50" inline />
              </SVGSet>
            </a>
            <a href="docs/" target="_self">
              Docs (v
              {packageJson.version})
            </a>
            <a href="https://stackoverflow.com/questions/tagged/immutable.js?sort=votes">
              Questions
            </a>
            <a href="https://github.com/facebook/immutable-js/">GitHub</a>
          </div>
        </div>
        <div className="coverContainer">
          <div className="cover">
            <div className="coverFixed">
              <div className="filler">
                <div className="miniHeaderContents">
                  <a href="docs/" target="_self">
                    Docs (v
                    {packageJson.version})
                  </a>
                  <a href="https://stackoverflow.com/questions/tagged/immutable.js?sort=votes">
                    Questions
                  </a>
                  <a href="https://github.com/immutable-js-oss/immutable-js">
                    Github
                  </a>
                </div>
              </div>
              <div className="synopsis">
                <div className="logo">
                  {(isMobile
                    ? [0, 0, 0, 0, 0, 0, 0]
                    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                  ).map((_, i) => (
                    <SVGSet key={i} style={t(y(s, i * sp), z(s, i * sp))}>
                      <Logo color="#c1c6c8" />
                      <Logo color="#6dbcdb" opacity={o(s, i * sp)} />
                    </SVGSet>
                  ))}
                  <SVGSet style={t(s * -0.55, 1)}>
                    <Logo color="#FC4349" />
                    <Logo color="#2C3E50" inline />
                  </SVGSet>
                </div>
              </div>
              <div className="buttons">
                <StarBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

function y(s, p) {
  return (p < s ? p : s) * -0.55;
}

function o(s, p) {
  return Math.max(0, s > p ? 1 - (s - p) / 350 : 1);
}

function z(s, p) {
  return Math.max(0, s > p ? 1 - (s - p) / 20000 : 1);
}

function t(y, z) {
  var transform = 'translate3d(0, ' + y + 'px, 0) scale(' + z + ')';
  return {
    transform: transform,
    WebkitTransform: transform,
    MozTransform: transform,
    msTransform: transform,
    OTransform: transform,
  };
}

module.exports = Header;
