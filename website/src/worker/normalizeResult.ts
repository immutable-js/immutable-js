import { JsonMLElementList } from './jsonml-types';

export interface DevToolsFormatter {
  header: (obj: unknown) => JsonMLElementList | null;
  hasBody: (obj: unknown) => boolean;
  body: (obj: unknown) => JsonMLElementList | null;
}

export interface ObjectForConsole {
  header: JsonMLElementList | null;
  body: JsonMLElementList | null;
}

// console.log(immutableFormaters)
export default function normalizeResult(
  immutableFormaters: Array<DevToolsFormatter>,
  result: unknown
): ObjectForConsole {
  const formatter = immutableFormaters.find((formatter) =>
    formatter.header(result)
  );

  if (!formatter) {
    return {
      header: ['span', JSON.stringify(result)],
      body: null,
    };
  }

  const body = formatter.hasBody(result) ? formatter.body(result) : null;

  return {
    header: formatter.header(result),
    body,
  };
}
