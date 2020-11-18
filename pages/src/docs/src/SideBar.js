/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Map, Seq } from '../../../../';
import getGlobalData from './global';

class SideBar extends Component {
  static propTypes = {
    focus: PropTypes.string,
    memberGroups: PropTypes.object,
    toggleShowInherited: PropTypes.func.isRequired,
    toggleShowInGroups: PropTypes.func.isRequired,
    selectDocVersion: PropTypes.func.isRequired,
    showInGroups: PropTypes.bool.isRequired,
    showInherited: PropTypes.bool.isRequired,
  };

  onDocVersionChanged = (evt) => {
    const index = evt.target.value;
    const versions = window.versions || [];
    if (versions[index]) {
      this.props.selectDocVersion(versions[index]);
    }
  };

  render() {
    const type = getGlobalData().Immutable;
    const versions = window.versions || [];
    const defaultVersionIndex = versions.findIndex(
      (v) => v.version === type.version
    );

    return (
      <div className="sideBar">
        <div className="toolBar">
          <div className="versionSelector">
            Doc version&nbsp;
            <select
              onChange={this.onDocVersionChanged}
              defaultValue={defaultVersionIndex}
            >
              {versions.map((v, index) => (
                <option value={index} key={v.version}>
                  {v.version}
                </option>
              ))}
            </select>
          </div>
          <div
            onClick={this.props.toggleShowInGroups}
            onKeyPress={this.props.toggleShowInGroups}
          >
            <span className={this.props.showInGroups ? 'selected' : ''}>
              Grouped
            </span>
            {' • '}
            <span className={this.props.showInGroups ? '' : 'selected'}>
              Alphabetized
            </span>
          </div>
          <div
            onClick={this.props.toggleShowInherited}
            onKeyPress={this.props.toggleShowInherited}
          >
            <span className={this.props.showInherited ? 'selected' : ''}>
              Inherited
            </span>
            {' • '}
            <span className={this.props.showInherited ? '' : 'selected'}>
              Defined
            </span>
          </div>
        </div>
        <div className="scrollContent">
          <h4 className="groupTitle">API</h4>
          {Seq(type.module)
            .flatMap((t, name) => flattenSubmodules(Map(), t, name))
            .map((t, name) => this.renderSideBarType(name, t))
            .valueSeq()
            .toArray()}
        </div>
      </div>
    );
  }

  renderSideBarType(typeName, type) {
    const isFocus = this.props.focus === typeName;
    const isFunction = !type.interface && !type.module;
    const call = type.call;
    const functions = Seq(type.module).filter((t) => !t.interface && !t.module);

    let label = typeName + (isFunction ? '()' : '');

    if (!isFocus) {
      label = (
        <NavLink exact to={'/' + typeName}>
          {label}
        </NavLink>
      );
    }

    const memberGroups = this.props.memberGroups;

    const members =
      !isFocus || isFunction ? null : (
        <div className="members">
          {call && (
            <section>
              <h4 className="groupTitle">Construction</h4>
              <div>
                <NavLink exact to={'/' + typeName + '/' + typeName}>
                  {typeName + '()'}
                </NavLink>
              </div>
            </section>
          )}

          {functions.count() > 0 && (
            <section>
              <h4 className="groupTitle">Static Methods</h4>
              {functions
                .map((t, name) => (
                  <div key={name}>
                    <NavLink exact to={'/' + typeName + '/' + name}>
                      {typeName + '.' + name + '()'}
                    </NavLink>
                  </div>
                ))
                .valueSeq()
                .toArray()}
            </section>
          )}

          <section>
            {Seq(memberGroups)
              .map((members, title) =>
                members.length === 0
                  ? null
                  : Seq([
                      <h4 key={title || 'Members'} className="groupTitle">
                        {title || 'Members'}
                      </h4>,
                      Seq(members).map((member) => (
                        <div key={member.memberName}>
                          <NavLink
                            exact
                            to={'/' + typeName + '/' + member.memberName}
                          >
                            {member.memberName +
                              (member.memberDef && member.memberDef.signatures
                                ? '()'
                                : '')}
                          </NavLink>
                        </div>
                      )),
                    ])
              )
              .flatten()
              .valueSeq()
              .toArray()}
          </section>
        </div>
      );

    return (
      <div key={typeName}>
        <h2>{label}</h2>
        {members}
      </div>
    );
  }
}

function flattenSubmodules(modules, type, name) {
  modules = modules.set(name, type);
  return type.module
    ? Seq(type.module)
        .filter((t) => t.interface || t.module)
        .reduce(
          (modules, subT, subName) =>
            flattenSubmodules(modules, subT, name + '.' + subName),
          modules
        )
    : modules;
}

export default SideBar;
