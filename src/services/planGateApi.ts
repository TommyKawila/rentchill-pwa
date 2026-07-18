import { NextResponse } from "next/server";
import { planGateResponse } from "@/services/planGateService";

export function jsonFromPlanGate(error: unknown) {
  const gate = planGateResponse(error);
  if (!gate) return null;
  return NextResponse.json({ error: gate.code }, { status: gate.status });
}
