import type { TypeDefs } from './TypeDefs';
import { SidebarLinks } from './Sidebar';

export function getSidebarLinks(defs: TypeDefs): SidebarLinks {
  return Object.values(defs.types).map(({ label, url }) => ({ label, url }));
}
