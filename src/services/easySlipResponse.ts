import type { SlipVerifyResult } from "@/services/slipVerificationService";

type EasySlipParty = {
  account?: {
    name?: { th?: string; en?: string };
    bank?: { account?: string };
    proxy?: { account?: string };
  };
};

export type EasySlipResponse = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
  data?: {
    isDuplicate?: boolean | string | number;
    isAmountMatched?: boolean | string | number;
    amountInOrder?: number;
    amountInSlip?: number;
    rawSlip?: {
      transRef?: string;
      amount?: { amount?: number };
      receiver?: EasySlipParty;
    };
    transRef?: string;
    amount?: { amount?: number };
    receiver?: EasySlipParty;
  };
};

function isTruthy(value: unknown) {
  return value === true || value === 1 || value === "true" || value === "1";
}

function formatBaht(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });
}

export function extractSlipAmount(data: EasySlipResponse["data"]) {
  return data?.amountInSlip ?? data?.rawSlip?.amount?.amount ?? data?.amount?.amount ?? null;
}

export function extractSlipTransRef(data: EasySlipResponse["data"]) {
  return data?.rawSlip?.transRef ?? data?.transRef ?? null;
}

export function extractSlipReceiver(data: EasySlipResponse["data"]) {
  const receiver = data?.rawSlip?.receiver ?? data?.receiver;
  if (!receiver) return null;

  const accountNumbers = [
    receiver.account?.bank?.account,
    receiver.account?.proxy?.account,
  ].filter((value): value is string => Boolean(value?.trim()));

  const name =
    receiver.account?.name?.th?.trim() ||
    receiver.account?.name?.en?.trim() ||
    null;

  return { accountNumbers, name };
}

function messageIndicatesDuplicate(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("duplicate") || message.includes("ซ้ำ");
}

function resolveErrorCode(payload: EasySlipResponse) {
  return payload.error?.code?.toLowerCase() ?? "";
}

export function resolveEasySlipFailureMessage(payload: EasySlipResponse) {
  const code = resolveErrorCode(payload);
  const message = payload.error?.message ?? payload.message ?? "";

  if (code.includes("duplicate") || messageIndicatesDuplicate(message)) {
    return "สลิปนี้เคยใช้แล้ว กรุณาส่งสลิปใหม่";
  }

  if (code.includes("slip_not_found") || code.includes("qrcode")) {
    return "ไม่สามารถอ่านสลิปได้ กรุณาส่งรูปที่ชัดขึ้น";
  }

  if (code.includes("image_url_unreachable") || code.includes("invalid_url")) {
    return "ระบบเปิดไฟล์สลิปไม่ได้ กรุณาลองใหม่อีกครั้ง";
  }

  return message || "ตรวจสอบสลิปไม่ผ่าน";
}

export function buildSlipFailureResult(
  payload: EasySlipResponse,
  message: string,
): SlipVerifyResult {
  return {
    verified: false,
    amount: extractSlipAmount(payload.data),
    transRef: extractSlipTransRef(payload.data),
    message,
    receiver: extractSlipReceiver(payload.data),
  };
}

export function evaluateEasySlipChecks(
  payload: EasySlipResponse,
  expectedAmount: number,
): { passed: boolean; message: string } {
  const data = payload.data;
  const topMessage = payload.message ?? "";

  if (messageIndicatesDuplicate(topMessage)) {
    return {
      passed: false,
      message: "สลิปนี้เคยใช้แล้ว กรุณาส่งสลิปใหม่",
    };
  }

  if (!data) {
    return { passed: false, message: resolveEasySlipFailureMessage(payload) };
  }

  if (isTruthy(data.isDuplicate)) {
    return {
      passed: false,
      message: "สลิปนี้เคยใช้แล้ว กรุณาส่งสลิปใหม่",
    };
  }

  const slipAmount = extractSlipAmount(data);
  const orderAmount = data.amountInOrder ?? expectedAmount;

  if (data.isAmountMatched === false) {
    return {
      passed: false,
      message: `ยอดไม่ตรงกับบิล (สลิป ฿${slipAmount != null ? formatBaht(slipAmount) : "?"} / บิล ฿${formatBaht(orderAmount)})`,
    };
  }

  if (slipAmount != null && Math.abs(slipAmount - expectedAmount) > 0.009) {
    return {
      passed: false,
      message: `ยอดไม่ตรงกับบิล (สลิป ฿${formatBaht(slipAmount)} / บิล ฿${formatBaht(expectedAmount)})`,
    };
  }

  if (expectedAmount > 0 && data.isAmountMatched === undefined && slipAmount == null) {
    return {
      passed: false,
      message: "ไม่สามารถอ่านยอดจากสลิปได้ กรุณาส่งใหม่",
    };
  }

  return { passed: true, message: payload.message ?? "Slip verified" };
}
