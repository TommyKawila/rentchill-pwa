# RentChill PWA: UX/UI Design System & Component Rules

## 1. Target Audience & Core Persona Context
* **Users:** Thai landlords, property managers, and condo owners aged 40–60+ (Gen X/Boomers).
* **Key Constraints:** Declining eyesight (presbyopia), low tolerance for complex multi-nested menus, high familiarity with basic LINE app layouts, values speed and data accuracy over fancy animations.
* **Core Philosophy:** "Less is More". Maximum utility, strict minimalism, zero decorative clutter. Separation of Concerns (keep UI presentation isolated from business logic).

## 2. Global Accessibility & Tailwind Layout Rules (Strict)
When reviewing or generating UI components, enforce these rules:
* **Font Size & Tracking:** Minimum body/input text is `16px` (`text-base`). Captions/labels minimum `14px` (`text-sm`). Tighten heading tracking (`tracking-tight`). Currency and room numbers must be bold (`font-bold`).
* **Click/Tap Targets:** All interactive items (buttons, links, inputs) must have a minimum height/width of `48px` (`h-12`). Primary action buttons must be `56px` (`h-14`) to prevent accidental misclicks by older users.
* **Spacing & Dividers:** Maintain a minimum gap of `12px` (`gap-3` or `space-y-3`) between adjacent interactive elements. Use clean vertical rhythms with generous padding (`p-6`). Delineate sections using sharp, 1px faint dividers (`border-zinc-100` or `divide-zinc-100`). Avoid heavy shadows.
* **Contrast & Colors:** Use pure white background (`bg-white`) and ultra-subtle off-white (`bg-zinc-50`) for panels/sidebars. Primary text must be deep charcoal (`text-zinc-900`), and labels must be muted zinc (`text-zinc-500`). Do not use full-page gradients or rainbow accents.
* **Color Palette (brand):**
  * Brand: `rc-green` `#32b04d` (primary fill), `rc-green-dark` `#28943f` (hover/pressed), `rc-green-soft` `#eef8f0` (soft fill), `rc-green-ink` `#1f7a35` (text on soft green).
  * Neutrals: white / zinc-50 panels / zinc-100 dividers / zinc-200 secondary borders / zinc-500 labels / zinc-900 body text.
  * Semantic: success `text-green-700 bg-green-50 border-green-200`; warning `text-amber-800 bg-amber-50 border-amber-200`; danger `text-red-600` (+ `bg-red-50` when needed); info tips only `text-sky-800 bg-sky-50`.
* **Buttons:**
  * Primary CTA (`min-h-14`): `bg-rc-green text-white hover:bg-rc-green-dark` — save / approve / pay / issue bill / enable notifications.
  * Secondary: `border border-zinc-200 bg-white text-zinc-900` — cancel / later / close.
  * Soft positive: `border-rc-green/30 bg-rc-green-soft text-zinc-900` — secondary positive CTAs (try free, plan select).
  * Selected chip/filter: `bg-rc-green text-white` (single chip) or soft green when a dense chip row.
  * Never use brand green for delete / reject / sign-out — use secondary or `text-red-600` for destructive text links.
* **Status badges:** Paid/attached → green; overdue/pending/waiting technician → amber; rejected/error → red; in-progress work → amber.
* **Labels:** Never rely solely on icons. Every icon button must have a clear Thai text label accompanying it (e.g., [Icon] ออกบิล, [Icon] แจ้งซ่อม).
* **Geometry:** Use clean radiuses: `rounded-xl` for container cards and `rounded-lg` for interactive inputs/buttons. No oversized or bubbly rounding.

## 3. Form Control & Interaction Safety
* **Form Submission Safety:** Every async action button (e.g., "ส่งสลิป", "สร้างบิลค่าเช่า") MUST implement a loading state. When processing, disable the button, reduce opacity (`opacity-50`), and change the cursor to `cursor-not-allowed` to strictly prevent double submissions.
* **Mobile Input Optimization:** For all monetary, unit, or phone number inputs, always enforce appropriate HTML attributes to trigger correct native mobile numeric keyboards (`type="number"`, `inputmode="decimal"`, or `inputmode="numeric"`).
* **Empty States:** If a dashboard or list has no data (e.g., "ไม่มีบิลค้างชำระ"), never leave a blank screen. Provide a beautifully padded, silent text message with a clear primary call-to-action button to guide the user on their next step.

## 4. PWA Landlord Interface Architecture
* **Navigation:** Clean bottom navigation bar for mobile layout. Maximum 4 tabs:
  1. หน้าแรก (Dashboard - Overview of urgent actions)
  2. ห้องพัก (Room & Document Management)
  3. บิลค่าเช่า (Billing & Payments)
  4. แจ้งซ่อม (Maintenance & Tickets)
* **Dashboard Structure:** Prioritize actionable micro-data over generic visual graphs. Display clear text-based callouts:
  * "X บิลยังไม่ได้ส่ง / ค้างชำระ"
  * "Y รายการแจ้งซ่อมใหม่จากลูกบ้าน"

## 5. Specific Feature Workflows

### A. Billing & Utility Meter Capture Flow
* **Linear Layout:** The step for entering water/electricity units must be strictly linear (top-to-bottom).
* **Camera Integration:** The photo upload for meters must feature a large, unmistakable trigger button.
* **Immediate Preview:** Show the uploaded image thumbnail directly above the input field so landlords can double-check the digits on the physical meter against their typed inputs side-by-side.

### B. Document & Tenant Management
* **List View over Cards:** Use clean, compact vertical list rows rather than large grid cards to let landowners view multiple rooms simultaneously without excessive scrolling.
* **File States:** Clearly display the status of uploaded documents using high-contrast text badges (e.g., "สำเนาบัตรประชาชน: [แนบแล้ว - สีเขียว `text-green-600` / `bg-green-50`]" หรือ "[ยังขาดอยู่ - สีส้ม]").

### C. Maintenance Ticket Management
* **Status Flags:** Use explicit Thai text badges for ticket statuses: `รอช่าง`, `กำลังซ่อม`, `เสร็จสิ้น`.
* **Direct Action:** Include a persistent, prominent link or button to dial the registered technician directly from the ticket view.

## 6. LINE LIFF Tenant Interface Architecture & Microcopy
* **Hyper-Focused Layout:** The tenant view must be a single, scrollable interface with zero deep navigation hierarchies.
* **The "One-Click" Rule:** The primary function is paying rent. The "จ่ายเงินผ่าน QR Code" action must be the most visually distinctive button on the viewport when a bill is pending.
* **Ticket Submission:** The issue reporting form must be restricted to 3 simple elements: Category selection dropdown, Photo upload box, and a short Description text area.
* **Language & Errors:** All UI text, form labels, errors, and placeholders must use plain, polite, and universally understood Thai. Avoid localized technical jargon (e.g., use "ประวัติการจ่ายเงิน" instead of "ทรานแซกชัน").
* **Error Handling:** Display validation errors inline right below the specific input field using clean, soft red text (`text-red-600`). Never use browser alert dialogs. Keep inputs focused on error if possible.

7. Official Thai Microcopy for Push Notifications & PWA
A. หน้าต่างขอสิทธิ์เปิดแจ้งเตือนภายในแอป (In-app Notification Soft Ask)
ใช้สำหรับแสดงผลเป็นกล่องข้อความภาษาไทยในแอป ก่อนที่ Native Browser Prompt ของเครื่องจะเด้งขึ้นมา

หัวข้อหลัก (Main Header): เปิดแจ้งเตือนเพื่อไม่พลาดทุกยอดเงิน

ข้อความอธิบาย (Body text): แนะนำให้เปิดไว้ครับ ระบบจะส่งข้อความแจ้งเตือนเข้ามือถือของคุณทันทีเมื่อ:

มีลูกบ้านแจ้งซ่อมห้อง (แอร์เสีย ท่อน้ำรั่ว ไฟดับ)

มีลูกบ้านส่งสลิปโอนเงินค่าเช่าเข้ามาใหม่

ปุ่มดำเนินการหลัก (Primary Button): [Icon กระดิ่ง] เปิดรับการแจ้งเตือนตอนนี้

ปุ่มยกเลิก (Secondary Button): ไว้ทีหลัง

B. หน้าต่างสอนการติดตั้งแอปบน iPhone (iOS Add to Home Screen Guide)
ใช้สำหรับแสดงผลเมื่อแอปตรวจพบว่าผู้ใช้เปิดผ่าน Safari บน iPhone และยังไม่ได้ติดตั้งลงเครื่อง (เนื่องจาก iOS บังคับให้แอดลงหน้าจอโฮมก่อน ถึงจะยอมให้เปิดระบบแจ้งเตือนได้)

หัวข้อหลัก (Main Header): วิธีนำ RentChill ไปไว้บนหน้าจอมือถือ

ข้อความอธิบาย (Body text): เพื่อความสะดวกในการใช้งานเหมือนแอปทั่วไป และเปิดระบบรับแจ้งเตือนค่าน้ำค่าไฟ กรุณาทำตาม 3 ขั้นตอนง่าย ๆ ด้านล่างนี้ครับ:

กดปุ่มแชร์: มองไปที่แถบเมนูด้านล่างสุดของหน้าจอ iPhone แล้วกดปุ่ม "แชร์" (ไอคอนรูปสี่เหลี่ยมที่มีลูกศรชี้ขึ้นตรงกลาง)

เลือกเพิ่มไปยังหน้าจอโฮม: เลื่อนเมนูขึ้นมาด้านบน แล้วแตะคำว่า "เพิ่มไปยังหน้าจอโฮม" (หรือ Add to Home Screen ที่มีไอคอนรูปเครื่องหมายบวก +)

กดเสร็จสิ้น: กดคำว่า "เพิ่ม" (หรือ Add) ที่มุมบนขวาของหน้าจอ เป็นอันเสร็จเรียบร้อย

C. สถานะในหน้าการตั้งค่า (Notification Settings State)
ใช้ในหน้า Settings เพื่อให้ Landlord ตรวจสอบสถานะการเชื่อมต่อระบบแจ้งเตือน

สถานะเปิดใช้งานสำเร็จ:

ข้อความ: [สีเขียว] ระบบแจ้งเตือนพร้อมใช้งานแล้ว

คำอธิบายย่อย: คุณจะได้รับข้อความแจ้งซ่อมและยอดเงินโอนตามปกติ

สถานะปิดใช้งานอยู่:

ข้อความ: [สีแดง] ปิดการแจ้งเตือนอยู่

คำอธิบายย่อย: คุณจะไม่ได้รับข้อความแจ้งเตือนบนมือถือเมื่อมีลูกบ้านส่งเรื่องเข้ามา