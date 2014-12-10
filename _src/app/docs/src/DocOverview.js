var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var Markdown = require('./Markdown');

var DocOverview = React.createClass({

  render() {
    var def = this.props.def;

    var doc = def.doc;
    var functions = Seq(def.module).filter(t => !t.interface && !t.module);
    var types = Seq(def.module).filter(t => t.interface || t.module);

    return (
      <div>

        {doc && <section>
          <Markdown contents={doc.synopsis} />
          {doc.description && <Markdown contents={doc.description} />}
        </section>}

        <h4 className="groupTitle">Functions</h4>

        {functions.map((t, name) =>
          <section className="interfaceMember">
            <h3 className="memberLabel">
              <Router.Link to={'/' + name}>
                {name + '()'}
              </Router.Link>
            </h3>
            {t.call.doc &&
              <Markdown className="detail" contents={t.call.doc.synopsis} />
            }
          </section>
        ).toArray()}

        <h4 className="groupTitle">Types</h4>

        {types.map((t, name) =>
          <section className="interfaceMember">
            <h3 className="memberLabel">
              <Router.Link to={'/' + name}>
                {name}
              </Router.Link>
            </h3>
            {t.doc &&
              <Markdown className="detail" contents={t.doc.synopsis} />
            }
          </section>
        ).toArray()}

      </div>
    );
  }
});

module.exports = DocOverview;
