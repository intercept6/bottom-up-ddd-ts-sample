export const range = (from: number, to: number) =>
  [...Array(to - from)].map((_, i) => from + i);
