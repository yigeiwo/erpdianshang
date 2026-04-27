export function escapeLikePattern(value: string): string {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

export function buildLikePattern(value: string): string {
  return `%${escapeLikePattern(value)}%`;
}
