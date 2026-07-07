export function buildLiffUrl(liffId: string) {
  return `https://liff.line.me/${liffId}`;
}

export function buildBoardLiffUrl(liffId: string) {
  return buildLiffUrl(liffId);
}
