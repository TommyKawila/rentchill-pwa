import {
  buildSlipFailureResult,
  evaluateEasySlipChecks,
  extractSlipAmount,
  extractSlipReceiver,
  extractSlipTransRef,
  resolveEasySlipFailureMessage,
  type EasySlipResponse,
} from "@/services/easySlipResponse";

export type SlipVerifyResult = {
  verified: boolean;
  amount: number | null;
  transRef: string | null;
  message: string;
  receiver: {
    accountNumbers: string[];
    name: string | null;
  } | null;
};

const EASYSLIP_URL = "https://api.easyslip.com/v2/verify/bank";

export async function verifySlipByUrl(
  slipUrl: string,
  expectedAmount: number,
  remark?: string,
): Promise<SlipVerifyResult> {
  const apiKey = process.env.EASYSLIP_API_KEY;
  if (!apiKey) {
    return {
      verified: false,
      amount: null,
      transRef: null,
      message: "EasySlip API key not configured",
      receiver: null,
    };
  }

  const response = await fetch(EASYSLIP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: slipUrl,
      matchAmount: expectedAmount,
      checkDuplicate: true,
      remark,
    }),
  });

  const payload = (await response.json()) as EasySlipResponse;

  if (!response.ok || !payload.success) {
    const checks = evaluateEasySlipChecks(payload, expectedAmount);
    if (!checks.passed) {
      return buildSlipFailureResult(payload, checks.message);
    }
    return buildSlipFailureResult(payload, resolveEasySlipFailureMessage(payload));
  }

  const checks = evaluateEasySlipChecks(payload, expectedAmount);
  if (!checks.passed) {
    return buildSlipFailureResult(payload, checks.message);
  }

  return {
    verified: true,
    amount: extractSlipAmount(payload.data),
    transRef: extractSlipTransRef(payload.data),
    message: checks.message,
    receiver: extractSlipReceiver(payload.data),
  };
}
