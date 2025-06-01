import type { InterfaceDefinition, MemberDefinition } from './TypeDefs';

export function collectMemberGroups(
  interfaceDef: InterfaceDefinition | undefined,
  showInGroups?: boolean,
  showInherited?: boolean
): Array<[groupTitle: string, members: Array<MemberDefinition>]> {
  const groups: { [groupTitle: string]: Array<MemberDefinition> } = {};

  const members = interfaceDef?.members
    ? Object.values(interfaceDef.members)
    : [];

  if (!showInGroups) {
    members.sort((a, b) => (a.id > b.id ? 1 : -1));
  }

  for (const member of members) {
    const groupTitle = (showInGroups && member.group) || '';
    if (showInherited || !member.inherited) {
      (groups[groupTitle] || (groups[groupTitle] = [])).push(member);
    }
  }

  return Object.entries(groups);
}
