# RentChill Marketing & Advertising Blueprint

> Source of truth for product positioning, copywriting, pricing, UX priorities, and ad campaigns.
> Philosophy: **Less is More** · **Complexity is the Enemy**

---

## 1. Core Value Proposition & Copywriting

**Hero Message**
> บริหารห้องเช่าให้เป็นเรื่องชิล ไม่ว่าคุณจะมีกี่ห้อง
> Manage rentals effortlessly, whether you have 1 or 100 rooms.

**Concept**
> เจ้าของชิล ลูกบ้านก็ชอบ
> Owners chill, tenants love it.

**Positioning**
Universal Monthly Billing System — ทำงานผ่าน LINE ทั้งระบบ (Frictionless Login, zero app download).

**The Problem**
การทวงบิล แจ้งค่าน้ำไฟ และเก็บสลิป คือความน่ารำคาญที่สุดของการปล่อยเช่า

**The Solution**
RentChill ตัดความซับซ้อน — ออกบิล จ่ายเงิน ตรวจสลิป จบใน LINE

**Tone of Voice**
พูดตรงไปตรงมา ไม่ขายฝัน ไม่ใช้ศัพท์เทคนิคหรูหรา เน้นความจริงใจ โปร่งใส และมินิมอล  
ข้อความ LINE ทวง/แจ้งบิล: สุภาพ เป็นระบบ ชัดเจน เป็นมืออาชีพ — ไม่ดุดันแบบเจ้าป้าหอ

### Brand Identity & Core Metaphor: The Shield

**Metaphor**
RentChill is a **Shield** (โล่ปกป้อง) — not a dashboard, not a chatbot, not another app to manage. It stands between the landlord and everything that breaks their peace: operational chaos, emotional friction (the awkwardness of asking for rent), and administrative errors. The landlord stays behind the shield; the hassle hits the shield instead.

**Tone & Voice**
Calm, secure, effortless, and highly professional. RentChill absorbs the stress so the landlord doesn't have to. Copy should feel like a trusted system working quietly in the background — never urgent, never salesy, never cluttered. Every message reinforces: *you're protected, you can chill.*

**Design Translation**
UI must feel solid, trustworthy, and distraction-free. Minimalist structure. Clear boundaries between actions. Zero clutter. If an element doesn't protect the landlord's time or peace, it doesn't belong on screen. **Less is More** is not a layout preference — it is the physical expression of the Shield.

---

## 2. Pricing Strategy (Volume + Feature Ladder)

แต่ละ tier ต่างกันทั้งจำนวนห้อง **และ** ฟีเจอร์ — margin-first: Starter = zero LINE variable cost

| Tier | Rooms | Price | Highlights |
|------|-------|-------|------------|
| **Free** | 1 | Free | ฟีเจอร์ครบทุกอย่าง — จำกัด 1 ห้อง |
| **Premium** | 20 | 299 THB/mo | ฟีเจอร์ครบทุกอย่าง — บริหารได้ถึง 20 ห้อง |
| **Pro** | 100 | 990 THB/mo | E-Sign · Bulk meter · Checklist + มัดจำ |

**Hard cap:** เกินจำนวนห้องของแผน → บล็อกฟีเจอร์ gated จนอัปเกรดหรือลดห้อง (ไม่ลบห้องอัตโนมัติ)

Feature gates อยู่ใน `src/services/planLimits.ts` · matrix UI ใน `planFeatureMatrix.ts`

---

## 3. User Mental Models & UX Priorities

> Guiding principle for all UI/UX development. **Less is More** · **Zero Friction**.

**Core Perception**
> A unified system that effortlessly handles monthly rent billing, slip verification, and routing tenant issues to the landlord.

**Priority 1: The Landlord (The Payer)**
- **Focus:** Extreme ease of management, saving time, and reducing operational headaches.
- **UX Goal:** Excellent, robust interface for bulk management on desktop, and quick status checks on mobile. Since they pay for the service, their workflow efficiency is our #1 priority.

**Priority 2: The Tenant (The End User)**
- **Focus:** Zero Friction and Speed.
- **UX Goal:** Tenants do not choose this app; landlords mandate it. Therefore, we do not need to build engagement features to make them "love" the app. The UI inside the LINE LIFF must be minimal, lightning-fast to load, with an obvious "Pay/Upload" button. Success is when the tenant spends less than 1 minute on our platform. Brand awareness is merely a byproduct.

---

## 4. Competitive Advantage (RentChill vs Legacy ERPs)

Legacy Thai PMS tools (e.g. Roomie, Horganice) are built as complex ERPs for 500+ room dorms with dedicated staff. RentChill wins Solopreneurs and Micro-Investors (1–100 rooms) through **Less is More** and the **Shield** philosophy.

| Dimension | Legacy ERPs | RentChill |
|-----------|-------------|-----------|
| **The Cockpit vs. The ATM** | Steep learning curve, cluttered desktop UI | Minimal, mobile-first Card UI — learn in ~1 minute |
| **App Fatigue vs. Zero Friction** | Force app downloads or complex portal logins | Seamless LINE LIFF — tenants pay and upload slips with zero friction |
| **Feature Bloat vs. Laser Focus** | Internal chat, contract generators, ERP sprawl | Perfect billing, auto-reminders, CSV export only; chat via **Zero-Dev Chat Routing** (landlord's LINE/phone) |
| **Pricing** | Feature-gated tiers | Flat-rate by volume — all premium features included |

**Positioning rule:** We do not compete on "most features." We compete on *least hassle* for landlords who want to chill.

---

## 5. Target Segments & Core Messages

### Segment A — Condo investors (2–10 rooms) — primary

**Status:** Busy professionals 30–45 in BKK / CM / Phuket — LINE ส่วนตัวปนกับงาน จำไม่ได้ว่าใครจ่ายแล้ว

**Message:** The Personal Assistant — แยกงานออกจากชีวิตส่วนตัว · ทวง/ส่งบิลอัตโนมัติสุภาพ

**Pain:** ทวงบิลยาก ไล่เช็คสลิปทีละแชท ลืมว่าใครค้าง · เอกสารกระจัด · ภาษีต้นปีวุ่น

**Deep dive:** See **§8 New-gen condo investor** for ad copy, pain points, and sale page wireframe.

### Segment B — Dorms & Juristic Persons (10–100+ rooms)

**Status:** มี LINE OA อยู่แล้ว ใช้ซอฟต์แวร์เก่าหรือกระดาษ

**Message:** The Bridge — เสียบ RentChill เข้า Rich Menu ของ LINE OA เดิม ไม่ต้องโหลดแอปใหม่

**Pain:** ระบบเดิมซับซ้อนเกินไป ลูกบ้านบ่นว่าจ่ายยาก

### Segment C — Property Agents / Sub-letters

**Status:** ดูแลหลายยูนิตให้หลายเจ้าของ

**Message:** The Central Dashboard — บริหาร 50 ห้อง 50 เจ้าของ จากหน้าจอเดียว

**Pain:** สลับบริบทบ่อย ไม่มีภาพรวมรายเดือน

### Segment D — Tenants (Brand Trust)

**Message:** บิลชัด จ่ายง่าย โปร่งใสทุกขั้นตอน ตรวจสอบได้ทันทีผ่าน LINE

---

## 6. Zero-Friction Ad Funnel

กรอง intent ด้วย sales page ก่อน — LINE เป็นช่องทางรองหลังสนใจ

| Stage | Action |
|-------|--------|
| **Awareness** | Facebook Ad เน้น Pain Point — หน้าจอแดชบอร์ดมินิมอล |
| **Interest** | CTA: "ดูรายละเอียด" → Sales page (`/`) — hero, ฟีเจอร์, พรีวิวแดชบอร์ด, ราคา |
| **Conversion** | CTA: "เริ่มใช้ฟรี 3 ห้อง" → `/admin/signup` → Starter → `/dashboard` |
| **Nurture (รอง)** | แอด LINE OA → พิมพ์ `demo` → Flex card → สมัคร Starter หรือดูตัวอย่างบิลลูกบ้าน |

---

## 7. Visual & Brand Guidelines

**Color Palette:**
- Brand Teal `#0D9488` — CTA, nav, chrome
- Success / Paid `#22C55E` — paid badges, revenue, net profit
- Warning `#F59E0B` · Danger `#EF4444`
- Background `#F8FAFC` · white cards · zinc neutrals
- LINE send only `#06C755` (not brand teal)
- Do **not** use Deep Blue as brand primary

**Typography:** IBM Plex Sans Thai + Inter (numbers) · White Space เยอะ · no decorative fonts

**Logo Rule:** โลโก้ต้องอยู่บนพื้นหลังกรอบขาวเสมอ

**Asset Rule:** Content series = 10 ภาพต่อ 1 ซีรีส์

---

## 8. New-gen condo investor (2–10 units)

> Primary ad/sale-page persona: working-class real estate investors aged **30–45**, tech-savvy busy pros with **2–10 rental condos** in Bangkok / Chiang Mai / Phuket. Full-time day job; renting is a side income.

### 8.1 Persona

- อายุ 30–45 · ทำงานประจำ · ปล่อยเช่าคอนโด 2–10 ยูนิตในเมืองใหญ่ (กทม. / เชียงใหม่ / ภูเก็ต)
- จัดการผ่านมือถือ · ต้องการความเร็ว มินิมอล และระบบทวง/ส่งบิลอัตโนมัติที่สุภาพ
- ต้องการระบบที่ “เกิดมาเพื่อแก้ชีวิตจริงๆ” ไม่ใช่ ERP ใหญ่
- Side-job professional — emotional friction from chasing rent is the #1 pain

### 8.2 Pain points (ขยี้ในโฆษณา)

| ID | TH | EN |
|----|----|-----|
| **The Chaser** | อึดอัดใจทุกครั้งที่ต้องทักไลน์ทวงค่าเช่า ไม่อยากเป็นเจ้าป้าหอสายโหด อยากรักษาความสัมพันธ์กับผู้เช่า | Awkward chasing rent in personal LINE — wants to stay friendly, not the strict landlord |
| **The Scattered Data** | สัญญาในอัลบั้ม LINE (หมดอายุ) สลิปปนรูปเที่ยว หน่วยไฟใน Keep — หาไม่เจอ | Contracts in LINE albums, slips mixed with photos, meter notes in Keep |
| **The Tax Nightmare** | ต้นปีย้อนสเตทเมนต์ หาบิลซ่อม/ล้างแอร์ คำนวณหักภาษี วุ่นวาย | Year-end tax scramble — repair bills, statements, hours lost |

### 8.3 Value proposition (จุดขาย Sale Page)

1. **100% PWA** — กดลิงก์เดียว ใช้บนมือถือทันที ลื่นเหมือนแอป ไม่หนักเครื่อง
2. **LINE OA automation** — RentChill OA ส่งบิลและทวง 3 ระดับ (T−1 / +3 / +7) สุภาพ ไม่ต้องออกหน้าเอง
3. **One-screen dashboard** — ห้องไหนจ่ายแล้ว ค้าง ว่าง ในหน้าเดียว
4. **Smart financial & tax reports** — Analytics ดูได้ทุกแผน · Growth+ ส่งออก Excel ยื่นภาษี · บันทึกค่าซ่อม (Growth+)

### 8.4 Ads copy bank (FB / TikTok / Lemon8)

**Emotional — เกรงใจ ไม่อยากทวงเอง**
- Hook: เบื่อไหม? ต้นเดือนทีไรต้องทำใจดีสู้เสือ ทักไลน์ไปทวงค่าเช่าผู้เช่าทุกที...
- Body: ให้ RentChill เป็นตัวกลางจัดการแทนคุณ! ระบบส่งบิลและแจ้งเตือนอัตโนมัติผ่าน LINE OA สุภาพ ชัดเจน ได้เงินไว โดยที่คุณไม่ต้องเอ่ยปากทวงเองให้ผิดใจกัน

**Functional — พอร์ตโต ข้อมูลรก**
- Hook: มีคอนโดปล่อยเช่าหลายห้อง แต่สัญญาเช่าอยู่ไลน์ สลิปอยู่ในโฟลว์ สเปรดชีตหาย?!
- Body: รวมทุกอย่างจบในมือถือเครื่องเดียวด้วย RentChill แอป PWA จัดการห้องเช่าสำหรับนักลงทุนรุ่นใหม่ เก็บเอกสารผู้เช่า จดค่าน้ำไฟ ส่งบิลเข้า LINE ใน 3 คลิก!

**Seasonal — ภาษีต้นปี**
- Hook: ยื่นภาษีคอนโดปล่อยเช่าทีไร รื้อหาบิลค่าซ่อมค่าล้างแอร์จนปวดหัว...
- Body: RentChill บันทึกรายรับ-รายจ่ายแยกรายห้องอัตโนมัติ ต้นปีปุ๊บ กดคลิกเดียวส่งออกรายงานภาษีพร้อมยื่นสรรพากรทันที เซฟเวลาชีวิตไปได้หลายวัน!

### 8.5 Sale page wireframe (`/`)

1. **Hero** — Mobile mock + slogan: *RentChill: บริหารคอนโดปล่อยเช่าครบวงจร ส่งบิล ทวงเงิน เก็บเอกสาร จบในแอปเดียวผ่าน LINE* · CTA เริ่มใช้ฟรี 3 ห้อง
2. **Agitate pain** — 3 cards: Chaser / Scattered / Tax
3. **Solution** — PWA no-install + LINE OA shield
4. **Feature showcase** — (1) Dashboard (2) Reminder Flex 3-tier (3) Analytics/tax export
5. **Pricing** — 4-tier cards + feature comparison table (`LandingPricingMatrixSkin`) · Micro = LINE auto · Growth = export + maintenance · Final CTA

Copy in app: `messages.ts` `landing.*` · Layout: `LandingSkin.tsx`
