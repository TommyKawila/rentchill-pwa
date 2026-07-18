# RentChill PWA: UX/UI Design System & Component Rules

## 1. Target Audience & Core Persona Context

* **Primary persona:** Working-class real estate investors — Thai busy professionals aged **30–45**, tech-savvy, managing rentals as a side income.
* **Portfolio size:** Typically **2–10 rental condos** in major tier-1 cities (**Bangkok, Chiang Mai, Phuket**).
* **Tech behavior:** Manage properties on-the-go via smartphone. Daily apps include LINE, mobile banking, Notion/Drive. Expects speed, minimalism, and professional automation — no manuals.
* **Preferred style:** Clean, modern, premium tech-savvy landlord. Glanceable cashflow and tenant status within ~3 seconds of opening the app.
* **Pain points this product solves:**
  * Emotional friction — awkward manual rent chasing on personal LINE.
  * Scattered data — contracts in LINE albums, slips in Photos, meters in Keep/Notes.
  * Tax/admin chaos — no clean revenue/expense trail at year-end.
* **Core Philosophy:** "Less is More". Card-first, clean modern UI. Zero decorative clutter. Separation of Concerns (UI presentation isolated from business logic).

---

## 2. Design Direction — DOs & DON'Ts

### DOs
* **Card-Based Design:** Each room/unit is a polished card — cover thumbnail, room number, status color strip/badge (`rc-success` = paid, teal brand for chrome, coral/red = overdue, zinc = vacant).
* **One-Click Share:** Bill / remind actions should hand off to LINE seamlessly (Thai landlords communicate with tenants primarily on LINE). Keep LINE copy polite, systemic, clear, professional — never aggressive “landlord nag” tone.
* **Visual Storage:** Document screens show ID card / lease thumbnails immediately — not filename-only rows.
* **Glanceable dashboard:** Cashflow + occupancy + open maintenance visible in the first viewport without dense tables.
* **Tenant access:** Tenants reach invoices via secure LINE / token link — no mandatory tenant registration or login screen.

### DON'Ts
* **No complex wide tables** or multi-column Excel-like spreadsheets that need horizontal scrolling on mobile.
* **No multi-step forms beyond 2–3 screens** for add-tenant or issue-bill flows.
* Do not invent purple/indigo gradient themes, Deep Blue as brand primary, or heavy multi-layer shadows.
* Do not force tenants through an app-store download or signup wall before viewing/paying a bill.

---

## 3. Mood & Tone / Color Palette

Theme: **Clean, Modern, Premium Tech-Savvy Landlord**.

**Primary (brand chrome):** Teal `#0D9488` — headers, primary CTA, bottom nav, highlights (sale page `/`).  
**Paid / Success / net profit:** `#22C55E` via `rc-success` (not brand teal).  
**Overdue / expense:** Danger red. **Warning:** Amber. **Vacant:** Zinc gray.  
**Background:** Light Slate `#F8FAFC` so white cards pop.

| Role | Token (Tailwind) | Hex |
|------|------------------|-----|
| Brand / primary fill | `rc-green` / `rc-secondary` | `#0D9488` |
| Brand hover/pressed | `rc-green-dark` | `#0F766E` |
| Brand soft fill | `rc-green-soft` | `#F0FDFA` |
| Brand ink on soft | `rc-green-ink` | `#134E4A` |
| Legacy alias (same teal) | `rc-primary` / `rc-primary-dark` / `rc-primary-soft` | aliased to teal in `globals.css` |
| Paid / Success / net | `rc-success` | `#22C55E` |
| Paid soft panel | `rc-success-soft` / `rc-success-ink` | `#F0FDF4` / `#166534` |
| Warning (pending / in progress) | `rc-warning` | `#F59E0B` |
| Danger / expense / overdue | `rc-danger` | `#EF4444` |
| Page background | `rc-bg` | `#F8FAFC` (slate-50) |
| Body text | `rc-text` | `#0F172A` |
| Vacant | zinc | `bg-zinc-100` / `text-zinc-600` |
| Info tips | sky | `text-sky-800` / `bg-sky-50` |
| LINE send only | `#06C755` | Invoice issue footer — not brand teal |

* Neutrals: white cards on `rc-bg` / slate panels / `zinc-100` dividers / `zinc-200` secondary borders / `zinc-500` labels.
* Prefer `rc-green*` for brand chrome; `rc-success*` for paid/revenue/net. Avoid raw Tailwind `green-*` classes.
* Paid panels: `border-rc-success/30 bg-rc-success-soft text-rc-success-ink`.
* Do **not** use Deep Blue `#1E3A8A` as brand primary.

### 3.1 Typography

Fonts: **IBM Plex Sans Thai** (Thai / UI) + **Inter** (Latin/numbers), loaded via `next/font/google` on `<body>`. No decorative fonts.

| Token | Size | Weight | Tailwind |
|-------|------|--------|----------|
| H1 | 32px | Bold | `text-h1` or `text-[32px] font-bold` |
| H2 | 20px | Bold | `text-h2` or `text-xl font-bold` |
| Body Large | 16px | Medium | `text-body-lg` or `text-base font-medium` |
| Body | 14px | Regular | `text-sm` |
| Caption | 12px | Regular | `text-caption` or `text-xs` (metadata only) |

### 3.2 Components

* **Radius:** `rounded-xl` (12px) cards; `rounded-lg` (8px) inputs/buttons; filter chips `rounded-full`.
* **Horizontal padding:** `px-4` (16px) on page shells (safe-area left/right).
* **Touch targets:** Interactive controls `min-h-12` (48px); primary CTAs **48–52px** (`min-h-12` … `min-h-[52px]`). Do not use `min-h-14` (56px) for new primary CTAs — **exception:** subscription / overflow monetization dialogs only (**§11.B**, **§11.C**).
* **Icons:** Lucide outline, 24px (`h-6 w-6`) in nav and headers; 20px acceptable in dense lists.
* **Primary CTA (new shells):** `bg-rc-green text-white hover:bg-rc-green-dark` at 48–52px height.
* **Secondary CTA:** `border border-zinc-200 bg-white text-zinc-900`.

---

## 4. Global Accessibility & Tailwind Layout Rules (Strict)

When reviewing or generating UI components, enforce these rules:

* **Font Size & Tracking:** Minimum body/input text is `16px` (`text-base`). Captions/labels minimum `14px` (`text-sm`). Tighten heading tracking (`tracking-tight`). Currency and room numbers must be bold (`font-bold`).
* **Click/Tap Targets:** Interactive items minimum `48px` (`min-h-12` / `h-12`). Primary action buttons **48–52px** (`min-h-12` to `min-h-[52px]`) for single-thumb mobile use.
* **Spacing & Dividers:** Minimum gap `12px` (`gap-3` / `space-y-3`) between adjacent interactive elements. Clean vertical rhythm; generous padding (`p-6` on section cards). Sharp 1px dividers (`border-zinc-100` / `divide-zinc-100`). Avoid heavy shadows.
* **Contrast & Colors:** White (`bg-white`) cards on `bg-rc-bg` (`#F8FAFC`). Body `text-zinc-900`; labels `text-zinc-500`. No full-page gradients or rainbow accents.
* **Buttons:**
  * Primary CTA (48–52px): `bg-rc-green text-white hover:bg-rc-green-dark` — save / approve / pay / issue bill / enable notifications.
  * Secondary: `border border-zinc-200 bg-white text-zinc-900` — cancel / later / close.
  * Soft brand: `border-rc-green/30 bg-rc-green-soft text-zinc-900` — secondary brand CTAs.
  * Selected chip/filter: `bg-rc-green text-white` (or soft teal when a dense chip row).
  * Never use brand teal for delete / reject / sign-out — use secondary or `text-red-600`.
* **Status badges:** Paid/attached → `rc-success` soft; overdue → coral/red; vacant → zinc; pending/waiting technician → amber; rejected/error → red; in-progress work → amber.
* **Labels:** Never rely solely on icons. Pair icons with clear Thai text (e.g. [Icon] ออกบิล, [Icon] แจ้งซ่อม).
* **Geometry:** `rounded-xl` for container cards; `rounded-lg` for inputs/buttons. Filter chips may use `rounded-full` pills. No oversized bubbly shapes.
* **Easy Mode:** Optional accessibility overlay (`data-easy-mode`) — larger type / stronger label contrast. Not the default for the primary persona.

---

## 5. Form Control & Interaction Safety

* **Form Submission Safety:** Async action buttons MUST show loading: disable, `opacity-50`, `cursor-not-allowed`.
* **Mobile Input Optimization:** Monetary / unit / phone inputs use `type="number"`, `inputmode="decimal"`, or `inputmode="numeric"`.
* **Empty States:** Never leave a blank screen. Padded message + clear primary CTA.
* **Form length:** Add-tenant and issue-bill flows should complete within **2–3 screens**.

---

## 6. PWA Landlord Interface Architecture

### Bottom navigation (4 tabs)
1. หน้าแรก (Dashboard — header, summary carousel, search/chips, room cards)
2. ระบบบัญชี (Accounting — billing command center, overview, link to Analytics)
3. แจ้งซ่อม (Maintenance)
4. ตั้งค่า (Settings)

Analytics (`/analytics`) is a secondary entry from the Accounting hub — not a bottom tab.

### Dashboard & property list IA (top → bottom, ~390px mobile, `px-4`)

| Block | Height | Spec |
|-------|--------|------|
| **1. Header** | ~60px | 40×40 avatar + greeting (`text-sm` gray / `text-base` bold name) + 40×40 `rc-primary` `+` add property |
| **2. Summary carousel** | ~110px | Horizontal snap cards: revenue collected/target + 6px `rc-success` bar; occupancy; open maintenance |
| **3. Search & chips** | ~90px | 44px search + 4 scroll chips (All / Overdue / Review / Vacant); active chip `rc-primary` |
| **4. Room list** | 88px/card | 56×56 thumb, project-room title, tenant+due line, status pill right |
| **5. Bottom nav** | 64px | Home · Accounting · Maintenance · Settings |

* Multi-property: compact property chip between header and carousel (when 2+ properties).
* Logout / locale / CSV tools live on Settings — not dashboard header.
* See **§10.D** for md+ Bento cash-flow extension (mobile keeps summary carousel above).

### Analytics & Reports (`/analytics`)

**User path:** Accounting hub → Analytics link → filters → visual summary → export.

| Block | UX |
|-------|-----|
| **1. Filters** | Timeframe chips (ปีนี้ / ปีที่แล้ว / 3 เดือนล่าสุด); property select (Portfolio / per property); optional room |
| **2. Summary cards** | Gross Revenue (`rc-success`) · Total Expenses (`rc-danger`) · Net Profit (bold `rc-success`) · Occupancy % |
| **3. Monthly chart** | Grouped SVG bars — revenue `rc-success` / expense `rc-danger`; tap tooltip + deep links |
| **4. Insights** | Top rooms by net profit; expense donut by maintenance category |
| **5. Export** | Excel download + print/PDF (`window.print`) |

* No dense Excel-style tables on mobile; charts over tables.
* Revenue = paid `invoices.total_amount` by `billing_month`; expenses = `maintenance_tickets.expense_amount` by month.

### PWA interaction patterns
* Prefer **pull-to-refresh** for latest payments / slips.
* Prefer **skeleton placeholders** over spinner-only loading while fetching.

### Landing / Sale page (`/`)

Wireframe per `marketing-blueprint.md` §8.5 · copy in `messages.ts` `landing.*` · layout in `LandingSkin.tsx`.

| Section | Spec |
|---------|------|
| **Hero** | Badge + full slogan + mobile phone mock (md+) · primary CTA → `/admin/signup` · trial → `/try` |
| **Pain** | 3 cards: Chaser / Scattered Data / Tax Nightmare (`LandingPainPointsSkin`) |
| **Solution** | Teal soft band: PWA no-install + LINE OA 3-tier shield (`LandingSolutionBandSkin`) |
| **Showcase** | 3-up: dashboard preview · reminder Flex mock · analytics/tax export mock (`LandingFeatureShowcaseSkin`) |
| **Pricing** | **Mobile (~390px):** §11.A room calculator (≤1 → Free · ≥2 → Premium ฿299). **md+:** 2-card Free vs Premium + comparison table (`LandingPricingMatrixSkin`). All features unlocked — room cap only |
| **Final CTA** | Dark band → `/admin/signup` |

* CSS-only mocks — no generated marketing images.
* Mobile-first `max-w-5xl`; cards `rounded-xl` + `border-zinc-100`.

### Pricing / room gating (owner app)

| Surface | Gate |
|---------|------|
| Issue bill footer | LINE OA send when tenant linked (`InvoiceIssueFooterSkin`) |
| Reminders | All tiers when LINE linked |
| Analytics export | All tiers |
| Maintenance nav/page | All tiers |
| Document vault | Full vault all tiers |
| **Free at room cap (1)** | `SubscriptionBannerSkin` + API `ROOM_LIMIT_EXCEEDED`; add-room → `UpgradePremiumModalSkin` → `/billing?plan=premium` (§11.B) |
| **Premium at room cap (20)** | Same banner + API; add-room → `ContactAdminOverflowModalSkin` → LINE OA admin chat with prefilled text (§11.C) — **not** `/billing` |

Source: `planLimits.ts` · hook: `useSubscription.ts` · copy: `marketing-blueprint.md` §2

---

## 7. Specific Feature Workflows

### A. Billing & Utility Meter Capture Flow
* **Linear Layout:** Water/electric entry is strictly top-to-bottom.
* **Camera Integration:** Large, unmistakable photo trigger.
* **Immediate Preview:** Thumbnail above the input for digit cross-check.
* **One-Click Share:** Issue bill / remind should support seamless LINE handoff.

### B. Document & Tenant Management
* **Card-Based Room List:** Modern vertical cards (thumb + status), not dense Excel-style tables.
* **Visual Storage:** ID / lease / slip previews as thumbnails; badges for attached vs missing.
* **File States:** High-contrast text badges (e.g. แนบแล้ว / ยังขาดอยู่).

### B2. Room Detail & Document Vault flow

**User path:** Dashboard room card → Room detail modal → Documents tab.

| Step | UX |
|------|-----|
| Tap room card | `active:scale-[0.98]` + brief bg darken; modal slides in from right |
| Room detail | Top tabs: **ข้อมูลทั่วไป** \| **ประวัติการเงิน** \| **เอกสารผู้เช่า** (active = teal) |
| Documents tab | Thumbnail preview cards in grid/list; FAB `+` (brand teal) for upload |
| Upload | Native file input with `capture="environment"` — camera or gallery on mobile |
| Swipe doc card left | Reveal **ลบ** + **แชร์** shortcuts (Web Share / LINE handoff) |
| Tap doc card | Image → fullscreen lightbox; PDF → open in new tab |

* Billing footer actions appear only on the **ประวัติการเงิน** tab.
* Keep modal architecture (no dedicated `/rooms/[id]` route).

### B3. Invoice Generator & LINE bill card

**User path:** Room detail modal → **generator-only full-screen mode** (back closes modal) when issuing a bill; otherwise **ประวัติการเงิน** tab for issued/slip states.

**Layout (~390px scroll, `px-4`, `pb-24` for sticky footer):**

| § | Block | Spec |
|---|-------|------|
| 1 (~90px) | Header | Back ← 24px; title `สร้างบิลแจ้งหนี้` (`text-lg font-bold`); 32×32 property thumb + `{property} - ห้อง {n}` bold + tenant gray `({name})` |
| 2 (~70px) | Period | Label `รอบบิลประจำเดือน`; full-width `h-11` native `<select>` `rounded-lg`; display `กรกฎาคม 2026` via month formatter |
| 3 (~280px) | Expenses | Rent read-only `h-11 bg-zinc-100`; water flat baht editable `ค่าน้ำประปา`; electric old/new ~45% columns + caption `คำนวณอัตโนมัติ: …`; `[+ เพิ่มรายการ]`; meter photos accordion |
| 4 (~140px) | Summary | `rounded-xl bg-rc-primary-soft p-4`; `ยอดรวมสุทธิ` + `text-[28px] font-bold text-rc-primary`; QR toggle switch (Lucide `QrCode`) |
| 5 (~80px) | Footer | `fixed inset-x-0 bottom-0` safe-area; `h-[50px]` LINE green `#06C755` + white LINE icon + `บันทึกและส่งบิลเข้า LINE OA` |

* **Secondary:** `คัดลอกข้อความ` text link above footer; **Save & next** outline only when utilities + bulk flow.
* **Preview before send:** Flex-style card modal mirrors tenant LINE message; Confirm / Cancel.
* **Send path:** Linked tenant → bot Flex push; unlinked → Web Share plain text + board link.
* No multi-step wizard beyond preview confirm.

### C. Maintenance Ticket Management

**User path:** Bottom nav **แจ้งซ่อม** → `/maintenance` (390px, `px-4`).

| § | Block | Spec |
|---|-------|------|
| 1 (~110px) | Header + tabs | Title **รายการแจ้งซ่อม** (`text-xl font-bold`); 3 equal-width underline tabs with counts — 🔴 รอดำเนินการ / 🟡 กำลังซ่อม / 🟢 เสร็จสิ้น; active = `border-b-2 border-rc-primary` |
| 2 (flex) | Ticket cards | Individual **96px** cards (`rounded-xl bg-white shadow-sm`); 64×64 thumb; `{property} - ห้อง {n}` + `ปัหา: {desc}` + `แจ้งเมื่อ: …`; chevron only — **no inline status select** |
| 3 | Detail sheet | Bottom sheet on card tap; **180px** pinch-zoom photo; combined technician field; bold expense input (`border-rc-primary`); tertiary Call/LINE links below photo |
| 4 (~80px) | Sticky footer | **waiting** → teal `rc-green` **ยืนยันช่างเข้าซ่อมแซม**; **in_progress** → `rc-success` **ซ่อมแซมเสร็จสิ้น (ปิดงาน)**; triggers tenant LINE + expense → Analytics |

* **Status flags:** Thai badges — `รอช่าง`, `กำลังซ่อม`, `เสร็จสิ้น`.
* **History:** Preserve repair trail (when, who, cost) for handoff continuity.
* **Direct Action:** Call / LINE technician links in detail sheet (not sticky footer).

---

## 8. LINE LIFF Tenant Interface Architecture & Microcopy

* **Hyper-Focused Layout:** Single scrollable surface; no deep navigation hierarchies.
* **The "One-Click" Rule:** "จ่ายเงินผ่าน QR Code" is the most distinctive CTA when a bill is pending.
* **Ticket Submission:** Category + photo + short description only.
* **Language & Errors:** Plain, polite Thai. Avoid jargon (use "ประวัติการจ่ายเงิน", not "ทรานแซกชัน"). See **§10.C** for TH/EN toggle and multi-currency target UX.
* **Error Handling:** Inline `text-red-600` under fields. No `alert()`. Keep focus on the errored input when possible.

### 8.1 Tenant Invoice PWA & LINE feedback loop

**User path:** LINE Flex (RentChill OA) → LIFF `/board` → QR save → attach slip → confirm → scanning.

| Block | UX |
|-------|-----|
| **1. Header** | Status badge (รอชำระ / รอตรวจสลิป / ชำระแล้ว); due-by line; property · room · billing month |
| **2. Breakdown** | Rent / water / electric / extras; large grand total |
| **3. PromptPay QR** | Dynamic amount QR when enabled; **บันทึกรูป QR Code ลงเครื่อง** |
| **4. Slip** | Large dashed attach zone; local preview; **ยืนยันการชำระเงิน** enabled only after file attached |

* **Slip flow:** attach-then-confirm (not one-tap upload).
* **Post-submit:** pastel green success panel on PWA; tenant LINE ack “ได้รับสลิปแล้ว…”; owner web push + dashboard scanning (existing).

**LINE Flex (bill issued):** RentChill header; single CTA **ดูบิลเต็มรูปแบบและจ่ายเงิน** → board LIFF URL.

### B4. Payment reminder Flex (3-tier, due-date relative)

**Trigger:** Cron + manual owner send; timing vs `billing_month` + `billing_day`:

| Tier | When | Header | CTA button |
|------|------|--------|------------|
| soft | T−1 (default 1 day before due) | ⏱️ แจ้งเตือนรอบบิลประจำเดือน | 📄 ดูบิลเต็มรูปแบบ & จ่ายเงิน (teal) |
| firm | +3 days overdue | 🔔 ใบแจ้งหนี้เกินกำหนดชำระ | ⚡ ชำระเงินและแนบสลิปทันที (teal) |
| final | +7 days overdue | 🚨 แจ้งเตือนด่วน | 💳 ชำระเงินด่วนที่สุด (`#dc2626`) |

* Body: personalized `{tenantName}`, `{propertyName}`, `{monthLabel}`, `{room}`; amount row **ยอดชำระสุทธิ**.
* **No dead ends:** every tier includes URI CTA → board LIFF (QR pay flow).
* Owner settings may override body paragraph only; Flex header/footer layout fixed.

### 8.2 Owner Slip Verification & Approval

**User path:** Dashboard `รอตรวจสลิป` filter / orange badge → Room Detail → **billing tab auto-focus** → compare & tap.

| Block | UX |
|-------|-----|
| **1. Match-check** | Two-column (stack on narrow): left **ยอดเรียกเก็บ** `text-3xl font-bold text-rc-green` (brand); right room + tenant + slip submitted time |
| **2. Slip preview** | ~55vh pinch-zoom image area (`SlipPinchZoomSkin`) |
| **3. Sticky footer** | Fixed modal bottom: primary **✓ ยอดเงินถูกต้องอนุมัติ** (~80%); icon **✕** reject (~20%) |

* **Approve:** brief `rc-success` pastel panel → dashboard `paid`; tenant Flex e-receipt via LINE.
* **Reject:** reason chips modal (not inline field) → `pending` + tenant LINE with reason + board resubmit link.
* **Auto-verify:** tertiary text link only (EasySlip plans); not in sticky footer.

### 8.3 Maintenance Ticket

**Tenant path:** board `#maintenance` → 3-block form → LINE Flex progress timeline; owner push on create.

| Block | UX |
|-------|-----|
| **1. Category** | Large icon chips: AC / plumbing / electrical / furniture / other (not `<select>`) |
| **2. Media** | Large dashed box — photo or short video; camera capture |
| **3. Submit** | Short description + full-width teal CTA |

**Owner path:** `/maintenance` bottom nav → equal-width underline status tabs with counts → 96px shadow thumb cards → bottom sheet (180px pinch-zoom, combined technician + expense) → status-specific sticky footer (`rc-green` confirm / `rc-success` close) → tenant LINE + Analytics expense.

---

## 9. Official Thai Microcopy for Push Notifications & PWA

### A. In-app Notification Soft Ask
**หัวข้อหลัก:** เปิดแจ้งเตือนเพื่อไม่พลาดทุกยอดเงิน

**ข้อความอธิบาย:** แนะนำให้เปิดไว้ครับ ระบบจะส่งข้อความแจ้งเตือนเข้ามือถือของคุณทันทีเมื่อ:

* มีลูกบ้านแจ้งซ่อมห้อง (แอร์เสีย ท่อน้ำรั่ว ไฟดับ)
* มีลูกบ้านส่งสลิปโอนเงินค่าเช่าเข้ามาใหม่

**ปุ่มหลัก:** [Icon กระดิ่ง] เปิดรับการแจ้งเตือนตอนนี้  
**ปุ่มรอง:** ไว้ทีหลัง

### B. iOS Add to Home Screen Guide
**หัวข้อหลัก:** วิธีนำ RentChill ไปไว้บนหน้าจอมือถือ

**ข้อความอธิบาย:** เพื่อความสะดวกในการใช้งานเหมือนแอปทั่วไป และเปิดระบบรับแจ้งเตือนค่าน้ำค่าไฟ กรุณาทำตาม 3 ขั้นตอนง่าย ๆ ด้านล่างนี้ครับ:

1. กดปุ่มแชร์ที่แถบเมนูด้านล่างของ iPhone
2. เลือก "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)
3. กด "เพิ่ม" (Add) ที่มุมบนขวา

### C. Notification Settings State
**เปิดใช้งาน:** [สีเขียว] ระบบแจ้งเตือนพร้อมใช้งานแล้ว — คุณจะได้รับข้อความแจ้งซ่อมและยอดเงินโอนตามปกติ  
**ปิดอยู่:** [สีแดง] ปิดการแจ้งเตือนอยู่ — คุณจะไม่ได้รับข้อความแจ้งเตือนบนมือถือเมื่อมีลูกบ้านส่งเรื่องเข้ามา

---

## 10. Premium Investor Business Feature Set & Component Constraints

When building or auditing components for core business features, enforce these operational and visual rules to eliminate manual tasks and reduce emotional fatigue for the modern landlord persona (§1). Cross-ref feature workflows in **§7** and tenant/owner paths in **§8**.

### A. Automated Slip Verification & Fast Reconciliation

* **Real-time UX:** When a tenant uploads a payment slip via LINE LIFF, the owner dashboard and room list must reflect verification status without requiring a manual browser refresh (polling, revalidation, or push-triggered refetch in hooks — logic in `src/hooks/` / services only).
* **Status row badges** (auto-verify outcome from service layer — distinct from §8.2 manual approve/reject):
  * Verified: `bg-rc-success-soft text-rc-success-ink` — `[✓] ตรวจสอบสลิปสำเร็จ`
  * Needs attention: `bg-red-50 text-rc-danger` — `[!] สลิปต้องตรวจสอบใหม่`
  * Do **not** use raw Tailwind `green-*` / `text-green-600` for success badges (per §3).
* **Loading state:** Skeleton row `bg-zinc-100 animate-pulse` while slip transaction data is fetched or evaluated (extends §6 skeleton pattern).
* **Clarifier:** This status row complements §8.2 — owner manual slip review (`scanning` + pinch-zoom + sticky approve/reject) remains canonical for human approval.

### B. Remote Maintenance Hub & One-Click Tech Dispatch

* **Remote landlord context:** Owners in Bangkok, Chiang Mai, or Phuket often dispatch repairs from off-site — zero-friction handoff to on-site technicians (extends §7 C / §8.3).
* **Dispatch CTA:** Open maintenance ticket cards and detail sheet must expose a prominent primary action to generate a clean summary text block + shareable link for one-tap forward to the technician's LINE (Web Share / copy — same LINE handoff pattern as §2).
* **Call button:** Large dial CTA `min-h-[52px]` (`h-12` … `min-h-[52px]` per §3.2 — not `h-14`) in the detail sheet viewport alongside Call/LINE links (§7 C: not in the status sticky footer).
* Status badge vocabulary (`รอช่าง`, `กำลังซ่อม`, `เสร็จสิ้น`) — see §7 C; do not duplicate here.

### C. Expat-Ready Multi-Language Billing

**Target UX** for tenant-facing LINE LIFF `/board`:

* Visible **TH | EN** toggle at the top of the viewport — easy tap; persist per session (e.g. localStorage).
* Component labels driven by i18n keys from the data layer; currency presentation from context (`฿`, `$`, or `currency` field) — no hardcoded symbols in Skins.
* Copy style: formal, accessible — e.g. "Payment History" / "ประวัติการชำระเงิน"; avoid colloquial jargon (extends §8 language rule).
* Implementation: `messages.ts` + tenant board hooks; UI in `TenantBoardShellSkin` and related Skins.

### D. Bento Cash Flow & Yield Tracker

Aggregate operational performance into visual data chunks — no dense administrative ledger tables on the home screen (§2 DON'Ts).

| Viewport | Layout |
|----------|--------|
| **Mobile (~390px)** | Keep §6 **summary carousel** (horizontal snap cards) — canonical home KPI entry |
| **md+ (`md:grid-cols-3`)** | Optional **Bento grid** `grid grid-cols-1 md:grid-cols-3 gap-4` on Accounting hub or dashboard expanded view |

**Bento card specs (md+ only):**

* **Net Cash Flow (main widget):** `text-3xl font-bold text-zinc-950 tracking-tight` — current month net after operational expenses; positive net may accent with `text-rc-success`.
* **Secondary cards:** Expected Monthly Revenue + Real-Time Rental Yield (%) — crisp text outputs separated by thin 1px dividers (`border-zinc-100`).
* **DON'T:** cluttered multi-color decorative charts on this bento block — full charts stay in `/analytics` (§6).

Data sources unchanged: `dashboardMetricsService`, `analyticsCashflowService`.

---

## 11. Two-Tier Subscription UX Rules (Anti-Clutter)

Product model: **Free** (1 room) vs **Premium ฿299/mo** (20 rooms). All features unlocked on both — **only room capacity** (+ Premium expiry) gates access. See `planLimits.ts` + `useSubscription.ts`.

### A. Strict Mobile Viewport Constraint

* **No multi-tier pricing rows on mobile:** Do **not** display four static price cards on ~390px viewports.
* **Preferred layout:** **Instant Room Calculator** — user enters condo count `n`; if `n ≤ 1` show Free; if `n ≥ 2` show Premium ฿299 (`LandingRoomCalculatorSkin`).
* **md+ exception:** 2-card Free vs Premium + comparison table on landing; single Premium checkout on `/billing`.
* **Do not confuse with dashboard carousel:** §6 summary carousel is unrelated — this rule applies to **pricing surfaces** only.

### B. High-Precision Upgrade Triggers

* When a Free user exceeds 1 room, show `UpgradePremiumModalSkin` — **one card only:** “Premium ฿299/เดือน · บริหารได้ถึง 20 ห้อง”.
* Upgrade route: `/billing?plan=premium`.
* **Subscription upgrade CTA (this modal + `/billing` checkout only):** `h-14 w-full bg-zinc-950 text-white hover:bg-zinc-900 rounded-lg font-bold` — monetization exception to §3.2 teal 48–52px rule.
* No per-module lock icons or upgrade chips — room cap is the only paywall.

### C. Overflow Custom Tier Handling (> 20 Rooms)

* **UX Workflow:** Do **not** render a third pricing card for users with more than 20 rooms on the public pricing page. Keep the interface locked to a 2-column layout (Free vs Premium). Landing room calculator (§11.A) may still recommend Premium for any `n ≥ 2` — never a “Custom / Enterprise” card.
* **Contextual Paywall:** The “Contact Admin” state must only trigger when a **Premium** user attempts to add a room beyond the 20-room hard limit (`plan_tier === "premium"` && `room_count >= 20`). Free users at cap continue to use §11.B (`UpgradePremiumModalSkin`).
* **UI Presentation:** Minimal dialog — `bg-white rounded-xl p-6 border border-zinc-100` (`ContactAdminOverflowModalSkin` or equivalent).
  * **Header:** `ขยายพอร์ตอสังหาริมทรัพย์ของคุณ` (`font-bold text-zinc-950`).
  * **Subtitle:** `ระบบตรวจพบว่าคุณใช้งานครบโควตา 20 ห้องแล้ว หากต้องการเพิ่มห้องพักสำหรับโครงการขนาดใหญ่ กรุณาติดต่อทีมงานเพื่อเปิดระบบเป็นรายกรณีครับ` (`text-zinc-500 text-base`).
  * **Action:** `h-14 w-full bg-zinc-950 text-white rounded-lg font-bold` — opens LINE Official Account admin chat with a **pre-filled text query** (platform support OA URL; not `/billing`).
  * **Dismiss:** secondary close control per §3.2 (`min-h-12`, zinc text) — same pattern as `UpgradePremiumModalSkin`.
