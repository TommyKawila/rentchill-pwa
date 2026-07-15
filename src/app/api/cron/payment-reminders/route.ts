import { NextResponse } from "next/server";
import { runPaymentReminderCron } from "@/services/paymentReminderCronService";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPaymentReminderCron();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron.payment-reminders.GET]", {}, error);
    const message = error instanceof Error ? error.message : "Cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
