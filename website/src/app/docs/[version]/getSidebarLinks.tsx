import { SidebarLinks } from '../../../sidebar';
import type { TypeDefs } from './TypeDefs';

export function getSidebarLinks(defs: TypeDefs): SidebarLinks {
  return Object.values(defs.types).map(({ label, url }) => ({ label, url }));
}
