/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Seq } from '../../../../';
import Markdown from './MarkDown';
import PropTypes from 'prop-types';

class DocOverview extends Component {
  static propTypes = {
    def: PropTypes.object.isRequired,
  };

  render() {
    const def = this.props.def;
    const doc = def.doc;

    return (
      <div>
        {doc && (
          <section>
            <Markdown contents={doc.synopsis} />
            {doc.description && <Markdown contents={doc.description} />}
          </section>
        )}

        <h4 className="groupTitle">API</h4>

        {Seq(def.module)
          .map((t, name) => {
            const isFunction = !t.interface && !t.module;
            if (isFunction) {
              t = t.call;
            }
            const anchorLink = `/${name}`;
            return (
              <section key={name} className="interfaceMember">
                <h3 className="memberLabel">
                  <Link to={anchorLink}>{name + (isFunction ? '()' : '')}</Link>
                </h3>
                {t.doc && (
                  <Markdown className="detail" contents={t.doc.synopsis} />
                )}
              </section>
            );
          })
          .valueSeq()
          .toArray()}
      </div>
    );
  }
}

export default DocOverview;
