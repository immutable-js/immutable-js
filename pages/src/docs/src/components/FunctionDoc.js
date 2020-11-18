import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MarkDown from '../MarkDown';
import { CallSigDef } from '../Defs';
import Disclaimer from './Disclaimer';

export default class FunctionDoc extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    def: PropTypes.object.isRequired,
  };

  render() {
    const name = this.props.name;
    const def = this.props.def;
    const doc = def.doc || {};

    return (
      <div>
        <h1 className="typeHeader">{name + '()'}</h1>
        {doc.synopsis && (
          <MarkDown className="synopsis" contents={doc.synopsis} />
        )}
        <code className="codeBlock memberSignature">
          {def.signatures.map((callSig, i) => [
            <CallSigDef key={i} name={name} callSig={callSig} />,
            '\n',
          ])}
        </code>
        {doc.notes &&
          doc.notes.map((note, i) => (
            <section key={i}>
              <h4 className="infoHeader">{note.name}</h4>
              {note.name === 'alias' ? (
                <CallSigDef name={note.body} />
              ) : (
                note.body
              )}
            </section>
          ))}
        {doc.description && (
          <section>
            <h4 className="infoHeader">
              {doc.description.substr(0, 5) === '<code'
                ? 'Example'
                : 'Discussion'}
            </h4>
            <MarkDown className="discussion" contents={doc.description} />
          </section>
        )}
        <Disclaimer />
      </div>
    );
  }
}
