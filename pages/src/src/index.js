var React = require('react');
var Header = require('./Header');
var readme = require('../../generated/readme.json');

var Index = React.createClass({
  render: function() {
    return (
      <div>
        <Header />
        <div className="pageBody" id="body">
          <div className="contents">
            <div dangerouslySetInnerHTML={{ __html: readme }} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Index;
