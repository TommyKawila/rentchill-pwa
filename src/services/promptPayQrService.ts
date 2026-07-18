function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string) {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function buildPromptPayEmv(promptPay: string, amount?: number) {
  const digits = promptPay.replace(/\D/g, "");
  if (!digits) return "";

  const merchant =
    digits.length >= 13
      ? tlv("02", digits)
      : tlv("01", digits.length === 10 ? `0066${digits.slice(1)}` : `0066${digits}`);

  const payload = tlv("29", tlv("00", "A000000677010111") + tlv("01", merchant));
  const amountPart =
    amount != null && amount > 0
      ? tlv("54", amount.toFixed(2))
      : "";
  const raw = `${tlv("00", "01")}${tlv("01", amountPart ? "12" : "11")}${payload}${amountPart}${tlv("58", "TH")}6304`;
  return raw + crc16(raw);
}

export function buildPromptPayQrImageUrl(promptPay: string, amount?: number) {
  const emv = buildPromptPayEmv(promptPay, amount);
  if (!emv) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(emv)}`;
}

export async function savePromptPayQrImage(qrUrl: string, filename = "rentchill-promptpay-qr.png") {
  const response = await fetch(qrUrl);
  if (!response.ok) throw new Error("SAVE_QR_FAILED");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  if (typeof navigator.share === "function") {
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    try {
      await navigator.share({ files: [file], title: filename });
      URL.revokeObjectURL(objectUrl);
      return;
    } catch {
      /* fall through to download */
    }
  }

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
