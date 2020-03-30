export function assertDefined<T>(toTest: T | null | undefined | false, msg: string): T {
  if(!toTest) {
    throw msg;
  }

  return toTest;
}

export function inspect(obj: {}): string {
  return JSON.stringify(obj, null, 2);
}
