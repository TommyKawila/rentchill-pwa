const LINE_API = "https://api.line.me/v2/bot";

type LineError = { message?: string };

export function getLineAccessToken() {
  return process.env.LINE_CHANNEL_ACCESS_TOKEN ?? null;
}

export async function lineFetch(
  url: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const error = payload as LineError;
    throw new Error(error.message ?? `LINE API error (${response.status})`);
  }

  return payload;
}

export async function lineBotFetch(path: string, init?: RequestInit) {
  const accessToken = getLineAccessToken();
  if (!accessToken) throw new Error("LINE_CHANNEL_ACCESS_TOKEN not configured");
  return lineFetch(`${LINE_API}${path}`, accessToken, init);
}
