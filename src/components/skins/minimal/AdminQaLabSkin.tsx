"use client";

import type { ReactNode } from "react";
import { ExternalLink, FlaskConical } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { useAdminQaLab } from "@/hooks/useAdminQaLab";
import type { PlanTier } from "@/services/propertyQuotaService";

const PLAN_TIERS: PlanTier[] = ["free", "premium"];

const LINE_TYPE_LABELS: Record<string, string> = {
  bill_issued: "admin.platform.lineType.bill_issued",
  bill_reissued: "admin.platform.lineType.bill_reissued",
  payment_reminder: "admin.platform.lineType.payment_reminder",
  slip_rejected: "admin.platform.lineType.slip_rejected",
  owner_slip_submitted: "admin.platform.lineType.owner_slip_submitted",
  maintenance_reported: "admin.platform.lineType.maintenance_reported",
  payment_confirmed: "admin.platform.lineType.payment_confirmed",
  subscription_grace: "admin.platform.lineType.subscription_grace",
  webhook_fallback: "admin.platform.lineType.webhook_fallback",
};

function lineTypeLabel(
  t: ReturnType<typeof useLocale>["t"],
  messageType: string,
) {
  const key = LINE_TYPE_LABELS[messageType];
  return key ? t(key as Parameters<typeof t>[0]) : messageType;
}

function QaCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-zinc-500">{children}</label>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none";

const selectClass = `${inputClass} bg-white`;

const btnPrimary =
  "w-full rounded-lg bg-rc-green py-3 text-sm font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50";

export function AdminQaLabSkin() {
  const { t } = useLocale();
  const qa = useAdminQaLab();

  const dashboardHref = qa.snapshot?.properties[0]?.slug
    ? `/dashboard?property=${encodeURIComponent(qa.snapshot.properties[0].slug)}`
    : null;

  const seedSuccess =
    qa.seedMessage?.includes("|") && qa.seedMessage !== "OK"
      ? qa.seedMessage.split("|").map(Number)
      : null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-amber-700">
        <FlaskConical className="h-4 w-4" />
        {t("admin.qa.badge")}
      </div>
      <p className="text-sm text-zinc-600">{t("admin.qa.desc")}</p>

      <QaCard title={t("admin.qa.account.title")}>
        <div>
          <FieldLabel>{t("admin.qa.account.email")}</FieldLabel>
          <div className="mt-1 flex gap-2">
            <input
              type="email"
              value={qa.ownerEmail}
              onChange={(e) => qa.setOwnerEmail(e.target.value)}
              className={inputClass}
              placeholder="owner@example.com"
            />
            <button
              type="button"
              disabled={qa.snapshotLoading || !qa.ownerEmail.trim()}
              onClick={() => void qa.loadSnapshot(qa.ownerEmail)}
              className={btnSecondary}
            >
              {qa.snapshotLoading ? t("common.loading") : t("admin.qa.account.load")}
            </button>
          </div>
          {qa.snapshotError && (
            <p className="mt-2 text-sm text-red-600">{qa.snapshotError}</p>
          )}
        </div>

        {qa.snapshot && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600 space-y-1">
            <p>
              {t("admin.qa.account.plan")}:{" "}
              <span className="font-semibold text-zinc-900">
                {qa.snapshot.plan_tier}
              </span>
            </p>
            <p>
              {t("admin.qa.account.rooms")}:{" "}
              <span className="font-semibold text-zinc-900">
                {qa.snapshot.room_count}
              </span>
            </p>
            {qa.snapshot.properties[0] && (
              <p>
                {t("admin.qa.account.property")}:{" "}
                <span className="font-semibold text-zinc-900">
                  {qa.snapshot.properties[0].slug}
                </span>
              </p>
            )}
            {dashboardHref && (
              <a
                href={dashboardHref}
                className="mt-2 inline-flex min-h-12 items-center gap-1.5 text-base text-zinc-900 underline"
              >
                {t("admin.qa.account.openDashboard")}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </QaCard>

      <QaCard title={t("admin.qa.plan.title")}>
        <div>
          <FieldLabel>{t("admin.qa.plan.tier")}</FieldLabel>
          <select
            value={qa.planTier}
            onChange={(e) => qa.setPlanTier(e.target.value as PlanTier)}
            className={selectClass}
          >
            {PLAN_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={qa.planLoading || !qa.ownerEmail.trim()}
          onClick={() => void qa.overridePlan()}
          className={btnPrimary}
        >
          {qa.planLoading ? t("common.loading") : t("admin.qa.plan.apply")}
        </button>
        {qa.planMessage && (
          <p
            className={`text-sm ${qa.planMessage === "OK" ? "text-rc-green-ink" : "text-red-600"}`}
          >
            {qa.planMessage === "OK"
              ? t("admin.qa.plan.success")
              : qa.planMessage}
          </p>
        )}
      </QaCard>

      <QaCard title={t("admin.qa.seed.title")}>
        <div>
          <FieldLabel>{t("admin.qa.seed.property")}</FieldLabel>
          <input
            type="text"
            value={qa.propertySlug}
            onChange={(e) => qa.setPropertySlug(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel>{t("admin.qa.seed.count")}</FieldLabel>
          <input
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            value={qa.roomCount}
            onChange={(e) => qa.setRoomCount(Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t("admin.qa.seed.mode")}</FieldLabel>
            <select
              value={qa.seedMode}
              onChange={(e) =>
                qa.setSeedMode(e.target.value as "replace" | "append")
              }
              className={selectClass}
            >
              <option value="replace">{t("admin.qa.seed.modeReplace")}</option>
              <option value="append">{t("admin.qa.seed.modeAppend")}</option>
            </select>
          </div>
          <div>
            <FieldLabel>{t("admin.qa.seed.lineMode")}</FieldLabel>
            <select
              value={qa.lineMode}
              onChange={(e) =>
                qa.setLineMode(e.target.value as "none" | "synthetic")
              }
              className={selectClass}
            >
              <option value="none">{t("admin.qa.seed.lineNone")}</option>
              <option value="synthetic">{t("admin.qa.seed.lineSynthetic")}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>{t("admin.qa.seed.statusMix")}</FieldLabel>
            <select
              value={qa.statusMix}
              onChange={(e) =>
                qa.setStatusMix(e.target.value as "fresh" | "mixed" | "random")
              }
              className={selectClass}
            >
              <option value="fresh">{t("admin.qa.seed.statusFresh")}</option>
              <option value="mixed">{t("admin.qa.seed.statusMixed")}</option>
              <option value="random">{t("admin.qa.seed.statusRandom")}</option>
            </select>
          </div>
          <label className="flex min-h-12 items-end gap-2 pb-1 text-base text-zinc-700">
            <input
              type="checkbox"
              checked={qa.withMeters}
              onChange={(e) => qa.setWithMeters(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            {t("admin.qa.seed.withMeters")}
          </label>
        </div>
        <button
          type="button"
          disabled={qa.seedLoading || !qa.propertySlug.trim()}
          onClick={() => void qa.seedRooms()}
          className={btnPrimary}
        >
          {qa.seedLoading ? t("common.loading") : t("admin.qa.seed.run")}
        </button>
        {seedSuccess && (
          <p className="text-sm text-rc-green-ink">
            {t("admin.qa.seed.success", {
              rooms: String(seedSuccess[0]),
              line: String(seedSuccess[1]),
            })}
          </p>
        )}
        {qa.seedMessage && qa.seedMessage !== "OK" && !seedSuccess && (
          <p className="text-sm text-red-600">{qa.seedMessage}</p>
        )}
      </QaCard>

      <QaCard title={t("admin.qa.line.title")}>
        {qa.lineLoading && !qa.logs.length ? (
          <p className="text-sm text-zinc-500">{t("common.loading")}</p>
        ) : (
          <>
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm space-y-1">
              <p>
                {t("admin.qa.line.mode")}:{" "}
                <span className="font-semibold text-zinc-900">{qa.pushMode}</span>
              </p>
              {qa.testRecipientId && (
                <p>
                  {t("admin.qa.line.recipient")}:{" "}
                  <span className="font-mono text-zinc-900">
                    {qa.testRecipientId}
                  </span>
                </p>
              )}
            </div>

            <div>
              <FieldLabel>{t("admin.qa.line.previewType")}</FieldLabel>
              <select
                value={qa.previewType}
                onChange={(e) => qa.setPreviewType(e.target.value as typeof qa.previewType)}
                className={selectClass}
              >
                {(qa.lineTypes.length ? qa.lineTypes : [qa.previewType]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {lineTypeLabel(t, type)}
                    </option>
                  ),
                )}
              </select>
            </div>

            {qa.previewText && (
              <pre className="whitespace-pre-wrap rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm text-zinc-700">
                {qa.previewText}
              </pre>
            )}

            <div>
              <FieldLabel>{t("admin.qa.line.testUserId")}</FieldLabel>
              <input
                type="text"
                value={qa.testLineUserId}
                onChange={(e) => qa.setTestLineUserId(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="button"
              disabled={qa.testPushLoading || !qa.testLineUserId.trim()}
              onClick={() => void qa.sendTestPush()}
              className={btnPrimary}
            >
              {qa.testPushLoading
                ? t("common.loading")
                : t("admin.qa.line.sendTest")}
            </button>

            {qa.testPushMessage && (
              <p
                className={`text-sm ${qa.testPushMessage === "OK" ? "text-rc-green-ink" : "text-red-600"}`}
              >
                {qa.testPushMessage === "OK"
                  ? t("admin.qa.line.sent")
                  : qa.testPushMessage}
              </p>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>{t("admin.qa.line.recentLogs")}</FieldLabel>
                <button
                  type="button"
                  onClick={() => void qa.loadLineLab(qa.previewType)}
                  className="text-sm text-zinc-500 underline"
                >
                  {t("admin.qa.line.refresh")}
                </button>
              </div>
              {qa.lineError && (
                <p className="mt-1 text-sm text-red-600">{qa.lineError}</p>
              )}
              {qa.logs.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">
                  {t("admin.qa.line.noLogs")}
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-100 text-sm">
                  {qa.logs.map((log) => (
                    <li key={log.id} className="px-3 py-2 text-zinc-600">
                      <span className="font-medium text-zinc-900">
                        {lineTypeLabel(t, log.message_type)}
                      </span>
                      {" · "}
                      {log.property_slug ?? "—"}
                      {" · "}
                      <span className="font-mono">{log.line_user_id}</span>
                      {log.simulated && (
                        <span className="ml-1 text-amber-700">
                          ({t("admin.qa.line.simulated")})
                        </span>
                      )}
                      {log.charged && (
                        <span className="ml-1 text-zinc-500">
                          ({t("admin.qa.line.charged")})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ol className="list-decimal space-y-1 pl-4 text-sm text-zinc-500">
              <li>{t("admin.qa.line.check1")}</li>
              <li>{t("admin.qa.line.check2")}</li>
              <li>{t("admin.qa.line.check3")}</li>
              <li>{t("admin.qa.line.check4")}</li>
            </ol>
          </>
        )}
      </QaCard>
    </div>
  );
}
