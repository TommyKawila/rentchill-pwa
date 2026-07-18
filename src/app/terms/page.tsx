"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LegalDocumentSkin } from "@/components/skins/minimal/LegalDocumentSkin";
import { termsDocument } from "@/content/legal/terms";

export default function TermsPage() {
  const { locale } = useLocale();
  return <LegalDocumentSkin document={termsDocument[locale]} active="terms" />;
}
