export function getVersionFromParams(params: { version: string }): string {
  return params.version.replace('%40', '@');
}
