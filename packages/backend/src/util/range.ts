export const range = (from: number, to: number): number[] =>
  [...Array(to - from)].map((_, i) => from + i);
