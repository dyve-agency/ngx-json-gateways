export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

export function upperFirst(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}
