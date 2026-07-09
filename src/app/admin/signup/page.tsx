"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

export default function AdminSignupPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? t("admin.signup.failed"));
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.signup.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="w-full max-w-sm rounded-xl border border-zinc-100 bg-white p-6"
      >
        <div className="mb-4 flex justify-end">
          <LocaleToggleSkin />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          RentChill
        </p>
        <h1 className="mt-2 text-xl font-bold">{t("admin.signup.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t("admin.signup.desc")}</p>

        <label className="mt-6 block space-y-1 text-sm">
          <span className="text-zinc-600">{t("admin.signup.name")}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            required
          />
        </label>

        <label className="mt-4 block space-y-1 text-sm">
          <span className="text-zinc-600">{t("admin.signup.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            required
          />
        </label>

        <label className="mt-4 block space-y-1 text-sm">
          <span className="text-zinc-600">{t("admin.signup.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            minLength={8}
            required
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? t("admin.signup.loading") : t("admin.signup.submit")}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {t("admin.signup.hasAccount")}{" "}
          <Link href="/admin/login" className="text-zinc-900 underline">
            {t("admin.signup.loginLink")}
          </Link>
        </p>
      </form>
    </main>
  );
}
