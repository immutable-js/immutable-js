var React = require('react');
var SVGSet = require('../../src/SVGSet');
var Logo = require('../../src/Logo');

var DocHeader = React.createClass({

  render: function() {
    return (
      <div className="header">
        <div className="miniHeader">
          <div className="miniHeaderContents">
            <a href="../" target="_self" className="logo">
              <SVGSet>
                <Logo color="#FC4349" />
                <Logo color="#2C3E50" inline={true} />
              </SVGSet>
            </a>
            <a href="./" target="_self">Documentation</a>
            <a href="https://github.com/facebook/immutable-js/issues/">Support</a>
            <a href="https://github.com/facebook/immutable-js/">Github</a>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = DocHeader;
