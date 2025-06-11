import { SIDEBAR_LINKS } from '../app/docs/currentVersion';
import { markdown } from './markdown';

export function genMarkdownDoc(version: string, typeDefSource: string): string {
  return markdown(
    typeDefSource
      .replace(/\n[^\n]+?Build Status[^\n]+?\n/, '\n')
      .replace('website/public', ''),
    {
      defs: {
        version,
        types: Object.fromEntries(
          SIDEBAR_LINKS.map((link) => {
            const qualifiedName = link.label.replace(/\(\)$/g, '');
            return [
              qualifiedName,
              {
                qualifiedName,
                label: link.label,
                url: link.url,
              },
            ];
          })
        ),
      },
    }
  );
}
