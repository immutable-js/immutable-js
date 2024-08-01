import { markdown } from './markdown';
import { getTypeDefs } from './getTypeDefs';

export function genMarkdownDoc(version: string, typeDefSource: string): string {
  return markdown(
    typeDefSource
      .replace(/\n[^\n]+?Build Status[^\n]+?\n/, '\n')
      .replace('website/public', ''),
    { defs: getTypeDefs(version) }
  );
}
