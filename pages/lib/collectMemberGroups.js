/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { Seq } = require('../../dist/immutable');
// Note: intentionally using raw defs, not getTypeDefs to avoid circular ref.

function collectMemberGroups(interfaceDef, options, defs) {
  const members = {};

  function collectFromDef(def, name) {
    def.groups &&
      def.groups.forEach((g) => {
        Seq(g.members).forEach((memberDef, memberName) => {
          collectMember(g.title || '', memberName, memberDef);
        });
      });

    def.extends &&
      def.extends.forEach((e) => {
        let superModule = defs.Immutable;
        e.name.split('.').forEach((part) => {
          superModule =
            superModule && superModule.module && superModule.module[part];
        });
        const superInterface = superModule && superModule.interface;
        if (superInterface) {
          collectFromDef(superInterface, e.name);
        }
      });

    function collectMember(group, memberName, memberDef) {
      let member = members[memberName];
      if (member) {
        if (!member.inherited) {
          member.overrides = { name, def, memberDef };
        }
        if (!member.group && group) {
          member.group = group;
        }
      } else {
        member = {
          group,
          memberName: memberName.substr(1),
          memberDef,
        };
        if (def !== interfaceDef) {
          member.inherited = { name, def };
        }
        members[memberName] = member;
      }
    }
  }

  if (interfaceDef) {
    collectFromDef(interfaceDef);
  }

  let groups = { '': [] };

  if (options.showInGroups) {
    Seq(members).forEach((member) => {
      (groups[member.group] || (groups[member.group] = [])).push(member);
    });
  } else {
    groups[''] = Seq(members)
      .toIndexedSeq()
      .sortBy((member) => member.memberName)
      .toArray();
  }

  if (!options.showInherited) {
    groups = Seq(groups)
      .map((members) => members.filter((member) => !member.inherited))
      .toObject();
  }

  return groups;
}

module.exports = collectMemberGroups;
