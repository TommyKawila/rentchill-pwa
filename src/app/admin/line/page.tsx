"use client";

import { Suspense } from "react";
import { useLineRichMenu } from "@/hooks/useLineRichMenu";

function LineSetupContent() {
  const { status, loading, deploying, error, success, deploy } = useLineRichMenu();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            LINE Setup
          </p>
          <h1 className="mt-2 text-2xl font-bold">Rich Menu → LIFF</h1>
          <p className="mt-2 text-sm text-zinc-600">
            เมนูด้านล่าง LINE OA → เปิดบิลลูกบ้าน
          </p>
        </header>

        <section className="mt-8 space-y-4 text-sm">
          {loading && <p className="text-zinc-500">กำลังโหลด...</p>}

          {status && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
              <p>
                <span className="text-zinc-500">LIFF URL:</span>{" "}
                <a href={status.liffUrl} className="break-all underline">
                  {status.liffUrl}
                </a>
              </p>
              <p>
                <span className="text-zinc-500">Endpoint (ตั้งใน LINE Console):</span>{" "}
                <span className="break-all">{status.endpointUrl}</span>
              </p>
              {status.message && (
                <p className="text-amber-700">{status.message}</p>
              )}
              {status.richmenus && status.richmenus.length > 0 && (
                <p className="text-zinc-600">
                  Rich menus: {status.richmenus.map((m) => m.name).join(", ")}
                </p>
              )}
            </div>
          )}

          <ol className="list-decimal space-y-2 pl-5 text-zinc-600">
            <li>LINE Console → LIFF → Endpoint URL = ด้านบน</li>
            <li>Vercel → ใส่ LINE_CHANNEL_ACCESS_TOKEN (Messaging API)</li>
            <li>กด Deploy Rich Menu ด้านล่าง</li>
            <li>เปิด LINE OA → กดเมนู &quot;ดูบิล&quot;</li>
          </ol>

          <button
            type="button"
            disabled={deploying || loading}
            onClick={() => void deploy()}
            className="w-full rounded-md bg-zinc-900 py-3 font-medium text-white disabled:opacity-50"
          >
            {deploying ? "กำลัง Deploy..." : "Deploy Rich Menu"}
          </button>

          {success && (
            <p className="rounded-md border border-green-200 bg-green-50 p-3 text-green-800">
              {success}
            </p>
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </p>
          )}

          <a href="/override?property=demo-apartment" className="block text-center underline">
            กลับ Override
          </a>
        </section>
      </div>
    </main>
  );
}

export default function LineSetupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <LineSetupContent />
    </Suspense>
  );
}
