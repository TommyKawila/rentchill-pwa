import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyLineSignature(
  body: string,
  signature: string,
  channelSecret: string,
) {
  const digest = createHmac("sha256", channelSecret.trim())
    .update(body)
    .digest();
  const expected = Buffer.from(signature, "base64");

  if (digest.length !== expected.length) return false;
  return timingSafeEqual(digest, expected);
}
