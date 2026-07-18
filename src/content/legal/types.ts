import type { Locale } from "@/services/i18n/messages";

export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export type LocalizedLegalDocument = Record<Locale, LegalDocument>;
