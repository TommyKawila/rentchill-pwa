"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

export type AdminLoginVariant = "owner" | "platform";

const LOGIN_PATHS: Record<AdminLoginVariant, string> = {
  owner: "/admin/login",
  platform: "/admin/platform/login",
};

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 px-3 py-2 text-base text-zinc-900";

function resolveDestination(
  variant: AdminLoginVariant,
  isSuperadmin: boolean,
  nextPath: string,
) {
  const defaultPath = isSuperadmin ? "/admin" : "/dashboard";
  const loginPrefix = LOGIN_PATHS[variant];

  if (
    !nextPath ||
    nextPath.startsWith(loginPrefix) ||
    nextPath.startsWith("/admin/login") ||
    nextPath.startsWith("/admin/platform/login")
  ) {
    return defaultPath;
  }

  if (isSuperadmin && nextPath.startsWith("/dashboard")) return "/admin";
  if (!isSuperadmin && nextPath.startsWith("/admin")) return "/dashboard";
  return nextPath;
}

export function AdminLoginFormSkin({ variant }: { variant: AdminLoginVariant }) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "";
  const isPlatform = variant === "platform";

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

      router.replace(
        resolveDestination(variant, Boolean(payload.is_superadmin), nextPath),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.login.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const badgeClass = isPlatform
    ? "text-sm font-medium uppercase tracking-wide text-amber-700"
    : "text-sm font-medium uppercase tracking-wide text-green-600";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="w-full max-w-sm rounded-xl border border-zinc-100 bg-white p-6"
      >
        <div className="mb-4 flex justify-end">
          <LocaleToggleSkin />
        </div>
        <p className={badgeClass}>RentChill</p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">
          {isPlatform ? t("admin.login.portalTitle") : t("admin.login.title")}
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          {isPlatform ? t("admin.login.portalDesc") : t("admin.login.desc")}
        </p>

        <label className="mt-6 block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("admin.login.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="mt-4 block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("admin.login.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            required
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? t("admin.login.loading") : t("admin.login.submit")}
        </button>

        {!isPlatform && (
          <p className="mt-4 text-center text-base text-zinc-500">
            <Link href="/admin/signup" className="inline-flex min-h-12 items-center text-zinc-900 underline">
              {t("admin.login.signupLink")}
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}
