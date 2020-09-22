function isArray(array: any): array is any[] {
  return array.isArray();
}

export function isStringArray(array: any): array is string[] {
  if (isArray(array)) {
    return array.findIndex((value) => typeof value !== 'string') === -1;
  } else {
    return false;
  }
}
