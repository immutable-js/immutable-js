var React = require('react');
var Header = require('./Header');
// eslint-disable-next-line import/no-unresolved
var readme = require('../../resources/readme.json');


var Index = React.createClass({
  render: function () {
    return (
      <div>
        <Header />
        <div className="pageBody" id="body">
          <div className="contents">
            <div dangerouslySetInnerHTML={{__html:readme}} />
          </div>
        </div>
      </div>
    );
  }
});


module.exports = Index;
