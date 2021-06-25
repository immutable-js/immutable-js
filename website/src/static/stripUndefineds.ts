export function stripUndefineds(obj: unknown) {
  if (Array.isArray(obj)) {
    for (const value of obj) {
      stripUndefineds(value);
    }
  } else if (isObj(obj)) {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        const value = obj[prop];
        if (value === undefined) {
          delete obj[prop];
        } else {
          stripUndefineds(value);
        }
      }
    }
  }
}

function isObj(value: unknown): value is { [prop: string]: unknown } {
  return typeof value === 'object' && value !== null;
}
