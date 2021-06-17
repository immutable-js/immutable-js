var React = require('react');

var MarkDown = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    var html = this.props.contents;
    return (
      <div
        className={this.props.className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  },
});

module.exports = MarkDown;
