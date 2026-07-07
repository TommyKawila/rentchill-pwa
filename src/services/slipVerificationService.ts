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

type EasySlipParty = {
  account?: {
    name?: { th?: string; en?: string };
    bank?: { account?: string };
    proxy?: { account?: string };
  };
};

type EasySlipResponse = {
  success?: boolean;
  message?: string;
  data?: {
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

const EASYSLIP_URL = "https://api.easyslip.com/v2/verify/bank";

function extractAmount(data: EasySlipResponse["data"]) {
  return data?.rawSlip?.amount?.amount ?? data?.amount?.amount ?? null;
}

function extractTransRef(data: EasySlipResponse["data"]) {
  return data?.rawSlip?.transRef ?? data?.transRef ?? null;
}

function extractReceiver(data: EasySlipResponse["data"]) {
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

function failureResult(
  payload: EasySlipResponse,
  message: string,
): SlipVerifyResult {
  return {
    verified: false,
    amount: extractAmount(payload.data),
    transRef: extractTransRef(payload.data),
    message,
    receiver: extractReceiver(payload.data),
  };
}

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
    return failureResult(payload, payload.message ?? "Slip verification failed");
  }

  const amount = extractAmount(payload.data);
  const transRef = extractTransRef(payload.data);
  const receiver = extractReceiver(payload.data);

  return {
    verified: true,
    amount,
    transRef,
    message: payload.message ?? "Slip verified",
    receiver,
  };
}
