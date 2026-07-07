"use client";

import { useCallback, useState } from "react";
import {
  buildTemplateWorkbook,
  parseImportWorkbook,
  summarizeImportRows,
  type ImportRow,
} from "@/services/excel/parseWorkbook";

type ImportStatus = "idle" | "parsing" | "importing" | "success" | "error";

type ImportSummary = {
  propertyCount: number;
  roomCount: number;
  slugs: string[];
};

export function useExcelImporter() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportSummary | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);

  const parseFile = useCallback(async (file: File) => {
    setStatus("parsing");
    setError(null);
    setResultSlugs([]);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseImportWorkbook(buffer);
      setRows(parsed);
      setPreview(summarizeImportRows(parsed));
      setStatus("idle");
    } catch (err) {
      setRows([]);
      setPreview(null);
      setStatus("error");
      setError(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ");
    }
  }, []);

  const importFile = useCallback(async (file: File) => {
    setStatus("importing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        imported?: { property_slug: string }[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Import failed");
      }

      setResultSlugs(payload.imported?.map((item) => item.property_slug) ?? []);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Import failed");
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    const buffer = buildTemplateWorkbook();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rentchill-import-template.xlsx";
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    status,
    error,
    preview,
    rows,
    resultSlugs,
    parseFile,
    importFile,
    downloadTemplate,
  };
}
