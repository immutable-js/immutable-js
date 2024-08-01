type Params = {
  version: string;
};

export function getVersionFromParams(params: Params): string {
  return params.version.replace('%40', '@');
}
