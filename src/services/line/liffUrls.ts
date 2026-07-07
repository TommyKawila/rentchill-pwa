export function buildLiffUrl(liffId: string, query?: Record<string, string>) {
  const base = `https://liff.line.me/${liffId}`;
  if (!query || Object.keys(query).length === 0) return base;
  return `${base}?${new URLSearchParams(query).toString()}`;
}

export function buildBoardLiffUrl(
  liffId: string,
  query?: Record<string, string>,
) {
  return buildLiffUrl(liffId, query);
}
