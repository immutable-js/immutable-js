var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');
var { FunctionDef } = require('./Defs');

var DocOverview = React.createClass({

  mixins: [ Router.State ],

  render: function() {
    var type = defs.Immutable;
    var typeName = this.getParams().typeName;

    var doc = type.doc;
    var call = type.call;
    var functions = Seq(type.module).filter(t => !t.interface && !t.module);
    var types = Seq(type.module).filter(t => t.interface || t.module);

    return (
      <div>

        {doc && <section>
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
        </section>}

        {call && <FunctionDef name={typeName} def={call} />}

        {functions.count() > 0 &&
          <section>
            {functions.map((t, name) =>
              <FunctionDef key={name} name={name} def={t.call} module={typeName} />
            ).toArray()}
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h2>Types</h2>
            {types.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + (typeName?typeName+'.'+name:name)}>
                  {(typeName?typeName+'.'+name:name)}
                </Router.Link>
                {t.doc && <div>
                  {t.doc.synopsis}
                </div>}
              </div>
            ).toArray()}
          </section>
        }

      </div>
    );
  }
});

module.exports = DocOverview;
