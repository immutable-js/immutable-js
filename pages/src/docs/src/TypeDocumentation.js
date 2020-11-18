/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import RouterPropTypes from 'react-router-prop-types';
import isMobile from './isMobile';
import SideBar from './SideBar';
import DocOverview from './DocOverview';
import collectMemberGroups from '../../../lib/collectMemberGroups';
import getGlobalData from './global';
import FunctionDoc from './components/FunctionDoc';
import TypeDoc from './components/TypeDoc';

const emptyMatch = {};
const FIXED_HEADER_HEIGHT = 75;

class TypeDocumentation extends Component {
  static propTypes = {
    match: RouterPropTypes.match,
  };

  constructor(props, ...args) {
    super(props, ...args);
    this.state = {
      showInherited: true,
      showInGroups: true,
    };
  }

  componentDidMount() {
    if (this.props.match && this.props.match.params) {
      this.scrollToElement(this.props.match.params);
    }
  }

  componentDidUpdate(prevProps) {
    const previousMatch =
      prevProps.match && prevProps.match.params
        ? prevProps.match.params
        : emptyMatch;
    const thisMatch =
      this.props.match && this.props.match.params
        ? this.props.match.params
        : emptyMatch;
    if (
      previousMatch.name !== thisMatch.name ||
      previousMatch.memberName !== thisMatch.memberName
    ) {
      this.scrollToElement(thisMatch);
    }
  }

  offsetTop(node) {
    let top = 0;
    do {
      top += node.offsetTop;
    } while ((node = node.offsetParent));
    return top;
  }

  scrollToElement(params) {
    if (typeof document === 'undefined') {
      // pre-rendering, skip scrolling
      return;
    }
    const { name, memberName } = params;
    const id = memberName ? `/${name}/${memberName}` : `/${name}`;
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        left: window.scrollX,
        top: this.offsetTop(element) - FIXED_HEADER_HEIGHT,
        behavior: 'auto',
      });
    }
  }

  determineDoc() {
    const rootDef = getGlobalData().Immutable;

    if (!this.props.match) {
      return {
        def: rootDef,
        name: undefined,
        memberName: undefined,
      };
    }

    const { name, memberName } = this.props.match.params;
    const namePath = name ? name.split('.') : [];
    const def = namePath.reduce(
      (def, subName) => def && def.module && def.module[subName],
      rootDef
    );

    return { def, name, memberName };
  }

  toggleShowInGroups = () =>
    this.setState((prevState) => ({ showInGroups: !prevState.showInGroups }));

  toggleShowInherited = () =>
    this.setState((prevState) => ({ showInherited: !prevState.showInherited }));

  selectDocVersion = (version) => {
    const currentVersion = getGlobalData().Immutable.version;
    // determine path when deployed in a sub folder of the domain
    let path = window.location.pathname.substring(
      0,
      window.location.pathname.indexOf('/docs/') + 5
    );
    if (currentVersion === version) {
      return;
    }

    if (!version.isLatest) {
      path = `${path}/${version.docName}/`;
    }

    window.location.pathname = path;
  };

  render() {
    const { name, memberName, def } = this.determineDoc();
    const memberGroups = collectMemberGroups(
      def && def.interface,
      {
        showInGroups: this.state.showInGroups,
        showInherited: this.state.showInherited,
      },
      getGlobalData()
    );

    let docComponent;
    if (!def) {
      docComponent = <NotFound />;
    } else if (!name) {
      docComponent = <DocOverview def={def} />;
    } else if (!def.interface && !def.module) {
      docComponent = <FunctionDoc name={name} def={def.call} />;
    } else {
      docComponent = (
        <TypeDoc
          name={name}
          def={def}
          memberName={memberName}
          memberGroups={memberGroups}
        />
      );
    }

    return (
      <div>
        {isMobile || (
          <SideBar
            focus={name}
            memberGroups={memberGroups}
            selectDocVersion={this.selectDocVersion}
            toggleShowInherited={this.toggleShowInherited}
            toggleShowInGroups={this.toggleShowInGroups}
            showInGroups={this.state.showInGroups}
            showInherited={this.state.showInherited}
          />
        )}
        <div key={name} className="docContents">
          {docComponent}
        </div>
      </div>
    );
  }
}

function NotFound() {
  return <div>Not found</div>;
}

export default TypeDocumentation;
