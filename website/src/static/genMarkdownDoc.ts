import { markdown } from './markdown';
import { getTypeDefs } from './getTypeDefs';

export function genMarkdownDoc(version: string, typeDefSource: string) {
  return markdown(
    typeDefSource.replace(/\n[^\n]+?Build Status[^\n]+?\n/, '\n'),
    { defs: getTypeDefs(version) }
  );
}
