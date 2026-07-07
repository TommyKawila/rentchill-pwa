"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

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
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      }

      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
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
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          RentChill
        </p>
        <h1 className="mt-2 text-xl font-bold">เข้าสู่ระบบเจ้าของหอ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          สำหรับแดชบอร์ดเจ้าของหอ
        </p>

        <label className="mt-6 block space-y-1 text-sm">
          <span className="text-zinc-600">รหัสผ่าน</span>
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
          {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
