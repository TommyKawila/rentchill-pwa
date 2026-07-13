"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { TryPageSkin } from "@/components/skins/minimal/TryPageSkin";

function TryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const plan = searchParams.get("plan") ?? undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trial/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        redirect?: string;
      };
      if (!response.ok || !payload.ok || !payload.redirect) {
        throw new Error(payload.error ?? t("trial.page.error"));
      }
      router.replace(payload.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("trial.page.error"));
      setLoading(false);
    }
  };

  return (
    <TryPageSkin
      plan={plan}
      loading={loading}
      error={error}
      onStart={() => void handleStart()}
    />
  );
}

export default function TryPage() {
  const { t } = useLocale();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          {t("common.loading")}
        </main>
      }
    >
      <TryContent />
    </Suspense>
  );
}
