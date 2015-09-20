var fs = require('fs');
var path = require('path');

var React = require('react');
var Router = require('react-router');
Router.Link = React.createClass({
  displayName: 'Link',
  render() {
    return <a href={"." + this.props.to + ".html"}>{this.props.children}</a>
  }
})

var defs = require('../resources/immutable.d.json');

global.window = {};
var DocOverview = require('../app/docs/src/DocOverview');
var FunctionDoc = require('../app/docs/src/FunctionDoc');
var TypeDoc = require('../app/docs/src/TypeDoc');
var collectMemberGroups = require('./collectMemberGroups');

var Documentation = React.createClass({
  render() {
    var typeDefURL = "https://github.com/facebook/immutable-js/blob/master/type-definitions/Immutable.d.ts";
    var issuesURL = "https://github.com/facebook/immutable-js/issues";
    return (
<html>
  <head>
    <meta charSet="utf-8" />
    <title>Immutable.js</title>
    <link rel="icon" type="image/png" href="./static/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="stylesheet" href="//code.cdn.mozilla.net/fonts/fira.css" />
    <link rel="stylesheet" type="text/css" href="bundle.css" />
    <style dangerouslySetInnerHTML={{__html: `
      .contents { padding-top: 10px; }
      .disclaimer { margin-left: 20px; }
    `}} />
  </head>
  <body>
    <div className="pageBody" id="body">
      <div className="contents">
        {this.props.children}
        <section className="disclaimer">
        This documentation is generated from <a href={typeDefURL}>Immutable.d.ts</a>.
        Pull requests and <a href={issuesURL}>Issues</a> welcome.
        </section>
      </div>
    </div>
  </body>
</html>
    );
  }
});

var FullTypeDoc = React.createClass({
  render() {
    var def = this.props.def;
    var memberGroups = collectMemberGroups(def && def.interface, {
      showInGroups: true,
      showInherited: true,
    });
    return <TypeDoc {...this.props} memberGroups={memberGroups} />
  }
});


function render(target, page, component) {
  var html = React.renderToStaticMarkup(
    <Documentation>{component()}</Documentation>
  );
  html = html.replace(
    /<a target=\"_self\" href=\"#\/([^\"]+)\"/g,
    function(m, m1) {
      var url = (m1.indexOf("/") == -1) ?
        m1 + ".html" : m1.replace("/", ".html#");
      return '<a target="_self" href="./' + url + '"';
    }
  );
  fs.writeFileSync(
    path.join(target, page + '.html'),
    '<!DOCTYPE html>' + html
  );
}

module.exports = function(target, done) {
  render(target, 'index', () => <DocOverview def={defs.Immutable} />);
  Object.keys(defs.Immutable.module).forEach((name) => {
    var def = defs.Immutable.module[name];
    if (!def.interface && !def.module) {
      render(target, name, () => <FunctionDoc name={name} def={def.call} />);
    } else {
      render(target, name, () => <FullTypeDoc name={name} def={def} />);
    }
  });
}
