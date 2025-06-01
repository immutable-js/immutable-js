import type { TypeDefs } from './TypeDefs';
import { SidebarLinks } from './sidebar';

export function getSidebarLinks(defs: TypeDefs): SidebarLinks {
  return Object.values(defs.types).map(({ label, url }) => ({ label, url }));
}
