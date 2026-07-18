"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LegalDocumentSkin } from "@/components/skins/minimal/LegalDocumentSkin";
import { privacyDocument } from "@/content/legal/privacy";

export default function PrivacyPage() {
  const { locale } = useLocale();
  return <LegalDocumentSkin document={privacyDocument[locale]} active="privacy" />;
}
