export function getCommonPath(paths: string[]) {
  if (paths.length === 0) return '';
  if (paths.length === 1) return paths[0];

  const pathParts = paths.map((path) => path.split('/'));
  const first = pathParts[0];
  const rest = pathParts.slice(1);

  const common: string[] = [];

  first.find((part, i) => {
    if (rest.find((parts) => part !== parts[i])) {
      return true;
    }
    common.push(part);
  });

  return common.join('/');
}

export function stripCommonPath(path: string, commonPath: string): string {
  if(path.startsWith(commonPath)) {
    return path.slice(commonPath.length);
  }

  return path;
}
