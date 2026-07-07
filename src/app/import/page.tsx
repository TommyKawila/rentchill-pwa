"use client";

import { useRef, useState } from "react";
import { useExcelImporter } from "@/hooks/useExcelImporter";

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const {
    status,
    error,
    preview,
    resultSlugs,
    parseFile,
    importFile,
    downloadTemplate,
  } = useExcelImporter();

  const onFileChange = async (next: File | null) => {
    setFile(next);
    if (next) await parseFile(next);
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            RentChill Import
          </p>
          <h1 className="mt-2 text-2xl font-bold">Excel Importer</h1>
          <p className="mt-2 text-sm text-zinc-600">
            อัปโหลด .xlsx เพื่อสร้างหอพักและห้องแบบ bulk
          </p>
        </header>

        <section className="mt-8 space-y-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="w-full rounded-md border border-zinc-300 bg-white py-3 text-sm font-medium"
          >
            Download Template (.xlsx)
          </button>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
            <span className="text-sm font-medium">เลือกไฟล์ .xlsx</span>
            <span className="mt-1 text-xs text-zinc-500">
              {file?.name ?? "ยังไม่ได้เลือกไฟล์"}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(event) => void onFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {preview && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
              <p>หอพัก: {preview.propertyCount}</p>
              <p>ห้อง: {preview.roomCount}</p>
              <p className="mt-2 break-all text-zinc-600">
                slug: {preview.slugs.join(", ")}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!file || status === "importing" || status === "parsing"}
            onClick={() => file && void importFile(file)}
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "importing" ? "กำลัง import..." : "Import to Supabase"}
          </button>

          {status === "success" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">Import สำเร็จ</p>
              {resultSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/${slug}`}
                  className="mt-2 block underline"
                >
                  เปิด /{slug}
                </a>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
