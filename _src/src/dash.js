var fs = require('fs');
var path = require('path');

var React = require('react');
var Router = require('react-router');
Router.Link = React.createClass({
  displayName: 'Link',
  render() {
    return <a target="_self" href={"#" + this.props.to}>{this.props.children}</a>
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
  childContextTypes: {
    getPageData: React.PropTypes.func.isRequired,
    makePath: React.PropTypes.func.isRequired,
    makeHref: React.PropTypes.func.isRequired,
    transitionTo: React.PropTypes.func.isRequired,
    replaceWith: React.PropTypes.func.isRequired,
    goBack: React.PropTypes.func.isRequired
  },
  getChildContext() {
    return {
      getPageData() {},
      makePath() {},
      makeHref() {},
      transitionTo() {},
      replaceWith() {},
      goBack() {},
    };
  },
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
    <Documentation>{component}</Documentation>
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

exports.html = function(target, done) {
  render(target, 'index', <DocOverview def={defs.Immutable} />);
  Object.keys(defs.Immutable.module).forEach((name) => {
    console.log("Building %s", name);
    var def = defs.Immutable.module[name];
    if (!def.interface && !def.module) {
      render(target, name, <FunctionDoc name={name} def={def.call} />);
    } else {
      render(target, name, <FullTypeDoc name={name} def={def} />);
    }
  });
}

exports.db = function(target, done) {
  var db = new (require('sqlite3').Database)(path.join(target, '../docSet.dsidx'));
  var q = [], lock = false;
  function exec(sql, params) {
    q.push([sql, params || []]);
    pop();
  }
  function pop() {
    if (q.length == 0 || lock) return;
    var [sql, params] = q.shift();
    lock = true;
    console.log("running %s %j", sql, params);
    db.run(sql, params, function(err) {
      if (err) throw err;
      lock = false;
      pop();
    });
  }
  exec("DROP TABLE IF EXISTS searchIndex");
  exec("CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)");
  exec("CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path)");
  var insert = "INSERT INTO searchIndex(name, type, path) VALUES (?, ?, ?);";
  Object.keys(defs.Immutable.module).forEach((name) => {
    var def = defs.Immutable.module[name];
    if (!def.interface && !def.module) {
      exec(insert, [name, 'Function', name + '.html']);
    } else {
      exec(insert, [name, 'Class', name + '.html']);
      exec(insert, [name + '()', 'Constructor', name + '.html#' + name]);
      insertStatics(name, def);
      insertMembers(name, def);
    }
  });

  function insertStatics(type, def) {
    var functions = Object.keys(def.module)
      .filter(n => !def.module[n].interface && !def.module[n].module)
      .forEach(n => {
        exec(insert, [type + '.' + n + '()', 'Function', type + '.html#' + n]);
      })
  }

  function insertMembers(type, def) {
    var members = collectMemberGroups(def && def.interface, {
      showInGroups: false,
      showInherited: true,
    })[''];
    members.forEach(member => {
      var method = !!member.memberDef.signatures;
      exec(insert, [
        type + '.' + member.memberName + (method ? '()' : ''),
        method ? 'Method' : 'Property',
        type + '.html#' + member.memberName
      ])
    });
  }
}
