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
  if(path.startsWith(commonPath + '/')) {
    return path.slice(commonPath.length + 1);
  }

  return path;
}


export function relativePath(from: string, to: string): string {
  from = from + '/';
  const commonPath = getCommonPath([from, to]);
  const fromLevel = stripCommonPath(from, commonPath).split('/').length - 1;
  const dives = Array(fromLevel).fill('..');
  to = [...dives, stripCommonPath(to, commonPath)].join('/');


  return to.startsWith('../') ? to : './' + to;
}

export function stripInterpolations(href: string): string {
  return href.split('/').filter((x) => !x.includes('{')).join('/');
}
