var React = require('react');

var SVGSet = React.createClass({
  render: function() {
    return (
      <svg className="svg" style={this.props.style} viewBox="0 0 300 42.2">
        {this.props.children}
      </svg>
    );
  },
});

module.exports = SVGSet;
