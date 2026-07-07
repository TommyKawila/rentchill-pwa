# RentChill - Implementation Tracker

## Phase 0: Project Setup (COMPLETED)
- [x] Initialize Next.js 14+ (App Router, Tailwind CSS, TypeScript)
- [x] Clean default boilerplate in `page.tsx` and `globals.css`
- [x] Create `.cursorrules` for core architectural principles
- [x] Setup `agent-skills/` directory with 4 expert system prompts

## Phase 1: Core Data & Logic (COMPLETED)
- [x] **Step 1:** Define Database Schema & Types (`src/services/types.ts` - Property, Room, Tenant, Invoice)
- [x] **Step 2:** Create Headless Engine Hook (`src/hooks/useInvoiceEngine.ts` - calculation logic isolated from UI)

## Phase 2: Routing & Views (PENDING)
- [x] **Step 3:** Routing Architecture 
  - [x] Public Property Profile (`app/[property_slug]/page.tsx`)
  - [x] Private Tenant Board (`app/(tenant)/board/page.tsx`)
- [x] **Step 4:** UI Skins & Frames
  - [x] Device Wrapper (`src/components/frames/MobileFrame.tsx`)
  - [x] Minimalist Invoice Skin (`src/components/skins/minimal/InvoiceSkin.tsx`)

## Phase 3: Integration & Fallbacks (COMPLETED)
- [x] **Step 5:** Connect UI to Headless Hooks
  - [x] Supabase client + service layer (`src/services/supabase/`, `propertyService`, `tenantService`, `invoiceService`)
  - [x] Core schema migration (`supabase/migrations/00001_rentchill_core_schema.sql`)
  - [x] Tenant Board wired to `useTenantBoard` + `useInvoiceEngine`
  - [x] Public Property Profile wired to Supabase
  - [x] LIFF auth (`useLineAuth` + tenant lookup by `line_user_id`)
- [x] **Step 6:** Excel Importer Tool (Migration Friction fallback)
  - [x] Parse `.xlsx` template (`src/services/excel/parseWorkbook.ts`)
  - [x] Bulk import API (`/api/import` + `excelImportService`)
  - [x] Import UI (`/import` + `useExcelImporter`)
- [x] **Step 7:** Manual Override / Fallback UI for Edge Cases
  - [x] Override service + API (`/api/override`)
  - [x] `useInvoiceOverride` + `OverrideSkin`
  - [x] Owner UI at `/dashboard?property=demo-apartment` (`/override` redirects)

---
*Note for AI Agents: Always check this file before suggesting new code to understand the current progress state. Do not jump ahead of the pending steps.*

## Phase 4: Beta Features (IN PROGRESS)
- [x] Admin auth for `/import` and `/override` (`ADMIN_SECRET` + middleware)
- [x] Pay flow — upload slip → status `scanning` (`usePaymentEngine` + Supabase Storage)
- [x] Property payment account settings + slip receiver matching
- [x] PDPA consent gate (`PdpaConsentSkin` + `/api/tenants/[id]/consent`)
- [x] LINE Rich Menu → LIFF (`/admin/line` + `/api/line/rich-menu`)
- [x] Owner Dashboard hub (`/dashboard` — slips, stats, nav to settings/import/LINE)
- [x] Monthly billing from Dashboard (`/api/billing` — meter entry + bulk invoice)
- [x] Tenant LINE invite link (`invite_code` + `/api/tenants/link` + board onboarding)
