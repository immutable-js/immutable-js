var React = require('react');

var typedef = require('../../../resources/immutable.d.json');

var Docs = React.createClass({
  render: function () {
    return <div>Docs: {JSON.stringify(typedef)}</div>;
  }
});

module.exports = Docs;
