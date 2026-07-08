"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

function AdminLoginForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        is_superadmin?: boolean;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? t("admin.login.failed"));
      }

      const defaultPath = payload.is_superadmin ? "/admin" : "/dashboard";
      const destination =
        nextPath && !nextPath.startsWith("/admin/login")
          ? payload.is_superadmin && nextPath.startsWith("/dashboard")
            ? "/admin"
            : !payload.is_superadmin && nextPath.startsWith("/admin")
              ? "/dashboard"
              : nextPath
          : defaultPath;

      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.login.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6"
      >
        <div className="mb-4 flex justify-end">
          <LocaleToggleSkin />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          RentChill
        </p>
        <h1 className="mt-2 text-xl font-bold">{t("admin.login.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t("admin.login.desc")}</p>

        <label className="mt-6 block space-y-1 text-sm">
          <span className="text-zinc-600">{t("admin.login.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            required
          />
        </label>

        <label className="mt-4 block space-y-1 text-sm">
          <span className="text-zinc-600">{t("admin.login.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            required
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLoading ? t("admin.login.loading") : t("admin.login.submit")}
        </button>
      </form>
    </main>
  );
}

function AdminLoginFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
