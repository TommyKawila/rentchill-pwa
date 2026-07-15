# RentChill E2E Test Checklist

**Environment:** `npm run build && npm start` (local) หรือ production URL  
**Note:** Web Push / Service Worker ไม่ทำงานใน `npm run dev`

**Device แนะนำ:** มือถือจริง 2 เครื่อง (owner + tenant) หรือ Chrome mobile emulation + LINE LIFF

---

## ก่อนเริ่ม (Prerequisites)

- [ ] Migration `00029`, `00030`, `00031` รันบน Supabase แล้ว
- [ ] `.env` มี `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- [ ] Owner login ได้ที่ `/dashboard`
- [ ] มี property ทดสอบ (เช่น `essence-chiangmai`) พร้อมห้อง + ผู้เช่า
- [ ] Settings → ใส่ **เบอร์ช่าง** (`technician_phone`) แล้วกดบันทึก
- [ ] Settings → เชื่อม **LINE Notify** ของ owner แล้ว (ถ้าจะทด LINE push)
- [ ] Supabase Storage มี bucket `maintenance` (อัปโหลดรูปแจ้งซ่อมได้)

**Property slug ทดสอบ:** `________________`

**Tenant ID ทดสอบ (dev):** `________________`

---

## A. Owner — Bottom Nav & Navigation

**URL:** `/dashboard?property={slug}`

- [ ] เปิด dashboard บนมือถือ → เห็น bottom nav 4 แท็บ: หน้าแรก · ห้องพัก · บิล · แจ้งซ่อม
- [ ] แตะ **ห้องพัก** → scroll ไป section ห้อง (hash `#rooms`) ไม่เปลี่ยนหน้า
- [ ] แตะ **บิลค่าเช่า** → ไป `/dashboard?property={slug}#billing` (รายการห้อง/ออกบิล)
- [ ] แตะ **แจ้งซ่อม** → ไป `/maintenance?property={slug}`
- [ ] แตะ **หน้าแรก** → กลับ dashboard
- [ ] ปุ่ม/ลิงก์ทุกจุดสูง ≥ 48px (กดง่าย ไม่พลาด)

---

## B. Owner — Dashboard Callouts

**URL:** `/dashboard?property={slug}`

**เตรียมข้อมูล:** มีบิลยังไม่ออก/ค้างชำระ + มี ticket สถานะ `รอช่าง` อย่างน้อย 1 รายการ

- [ ] เห็นกล่อง **งานด่วนวันนี้** — ตัวเลขแยก: ยังไม่ออกบิล / รอกรอกมิเตอร์ / พร้อมแล้ว (ไม่มีปุ่มออกบิลซ้ำ)
- [ ] เห็นแถบ **ออกบิลพร้อมแล้ว N ห้อง** เหนือรายการห้อง (ปุ่มเดียว)
- [ ] ปุ่ม disabled เมื่อยังไม่กรอกมิเตอร์ครบ (รวมน้ำ/ไฟ)
- [ ] กดปุ่มออกบิล → ออกเฉพาะห้องที่มิเตอร์ครบ
- [ ] กด **ติดตามค้างชำระ N ห้อง** → filter **ยังไม่จ่าย** active
- [ ] เห็น callout: `{N} รายการแจ้งซ่อมใหม่`
- [ ] กดลิงก์ → ไป `/maintenance?property={slug}`

---

## C. Owner — Maintenance Management

**URL:** `/maintenance?property={slug}`

- [ ] โหลดรายการ ticket ได้ (ไม่ blank ถ้ามีข้อมูล)
- [ ] แต่ละรายการแสดง: ห้อง · ชื่อผู้เช่า · หมวด · คำอธิบาย · badge สถานะ (รอช่าง / กำลังซ่อม / เสร็จสิ้น)
- [ ] มีรูปแนบ → thumbnail แสดงได้
- [ ] กด **โทรช่าง** → เปิด dialer ด้วยเบอร์จาก `technician_phone` (fallback `contact_phone`)
- [ ] เปลี่ยนสถานะ `รอช่าง` → `กำลังซ่อม` → UI อัปเดตทันที (badge เปลี่ยน)
- [ ] เปลี่ยนเป็น `เสร็จสิ้น` → รายการยังอยู่แต่สถานะเขียว
- [ ] ปุ่มเปลี่ยนสถานะ disabled + opacity ขณะ saving (กดซ้ำไม่ได้)
- [ ] Empty state (property ไม่มี ticket) → ข้อความ + CTA ชัดเจน (ไม่ใช่หน้าว่าง)

---

## D. Tenant — แจ้งซ่อม + ประวัติ

**URL:** `/board` (LINE LIFF) หรือ dev: `/board?tenant_id={uuid}`

- [ ] scroll ลงเห็น section **เรื่องแจ้งซ่อมของฉัน** (ถ้ามีประวัติ)
- [ ] กด **แจ้งซ่อมห้อง** → เลือกหมวด (dropdown)
- [ ] แนบรูป (optional) → preview แสดง
- [ ] กรอกรายละเอียด < 3 ตัวอักษร → error แดงใต้ field (ไม่มี alert popup)
- [ ] ไม่เลือกหมวด → error ใต้ dropdown
- [ ] กรอกครบ → กด **ส่งเรื่องแจ้งซ่อม**
- [ ] ปุ่ม disabled + "กำลังส่ง..." ขณะ submit
- [ ] สำเร็จ → ข้อความเขียว + hint + ปุ่ม **แจ้งเรื่องใหม่**
- [ ] รายการใหม่ปรากฏใน **เรื่องแจ้งซ่อมของฉัน** (หมวด · สถานะ · วันที่ · รูป)
- [ ] กด **แจ้งเรื่องใหม่** → ฟอร์มกลับมาให้กรอกใหม่

---

## E. Owner — รับแจ้งเตือน (LINE + Web Push)

**ทำหลัง Section D ส่งแจ้งซ่อมสำเร็จ**

### LINE Push (ถ้า owner เชื่อม LINE แล้ว)

- [ ] Owner ได้ข้อความ LINE แจ้งมีรายการแจ้งซ่อมใหม่
- [ ] ข้อความมีข้อมูลพอให้รู้ว่าเป็นห้อง/เรื่องอะไร

### Web Push

**เตรียม:** Owner เปิดแจ้งเตือนใน Settings แล้ว (Section F)

- [ ] Owner ได้ browser notification บนมือถือ/desktop
- [ ] กด notification → เปิดแอป/ไปหน้าที่เกี่ยวข้อง (maintenance หรือ dashboard)

### สลิปโอนเงิน (push ฝั่ง billing)

- [ ] Tenant ส่งสลิปค่าเช่า → owner ได้ web push (และ LINE ถ้าเชื่อม)
- [ ] ข้อความเกี่ยวกับยอดเงินโอน ไม่ใช่แจ้งซ่อม

---

## F. Owner — Web Push Subscribe Flow

**URL:** `/settings?property={slug}` (prod build, HTTPS)

- [ ] Section **การแจ้งเตือนบนมือถือ** แสดง
- [ ] ถ้า VAPID ไม่ตั้ง → ข้อความ "ยังไม่ได้ตั้งค่าระบบแจ้งเตือน..."
- [ ] ถ้า VAPID ตั้งแล้ว + ยังไม่อนุญาต → สถานะแดง + ปุ่ม **เปิดการแจ้งเตือน**
- [ ] (ครั้งแรก) modal soft-ask ภาษาไทย: หัวข้อ "เปิดแจ้งเตือนเพื่อไม่พลาดทุกยอดเงิน"
- [ ] กด **เปิดรับการแจ้งเตือนตอนนี้** → browser permission prompt
- [ ] อนุญาต → สถานะเขียว "ระบบแจ้งเตือนพร้อมใช้งานแล้ว"
- [ ] Reload หน้า → สถานะยังเขียว (subscription persist)
- [ ] กด **ไว้ทีหลัง** ใน soft-ask → ไม่ crash, ปิด modal ได้

### iOS Safari (ถ้าทดได้)

- [ ] ยังไม่ Add to Home → แสดง guide 3 ขั้นตอน Add to Home Screen
- [ ] หลัง Add to Home → เปิดแจ้งเตือนได้

### Soft-ask บนหน้าอื่น (ครั้งแรกหลัง login)

- [ ] Dashboard แสดง soft-ask ได้
- [ ] Billing แสดง soft-ask ได้
- [ ] Maintenance แสดง soft-ask ได้
- [ ] Import แสดง soft-ask ได้
- [ ] ไม่รบกวนซ้ำทุกครั้งที่เปิดหน้า

---

## G. Owner — Settings (Technician Phone)

**URL:** `/settings?property={slug}`

- [ ] ช่อง **เบอร์ช่างซ่อม** เปิด keyboard ตัวเลขบนมือถือ
- [ ] บันทึกเบอร์ใหม่ → success feedback
- [ ] กลับ maintenance → ปุ่มโทรช่างใช้เบอร์ใหม่

---

## H. Owner — Billing + Bottom Nav

**URL:** `/dashboard?property={slug}#billing`

- [ ] Bottom nav 4 แท็บ แสดง แท็บ **บิล** active
- [ ] แถบ **ออกบิลพร้อมแล้ว N ห้อง** เหนือรายการ — ปุ่มเดียว, loading + disabled ขณะ saving
- [ ] รับสลิปจาก tenant → สถานะบิลอัปเดต
- [ ] กลับ dashboard → callout บิลตัวเลขลดลงตามจริง

---

## I. Tenant — LIFF Board (Core flows)

**URL:** `/board` ผ่าน LINE

- [ ] Login LINE สำเร็จ (ไม่ค้าง loading)
- [ ] มีบิลค้าง → ปุ่ม **จ่ายเงินผ่าน QR Code** เด่นที่สุด
- [ ] ประวัติการจ่ายเงิน → กดดูบิลเก่าได้
- [ ] ส่งสลิป → loading state + ไม่ double submit
- [ ] ติดต่อเจ้าของ → แสดง LINE/เบอร์
- [ ] Typography อ่านง่าย (`text-base` body, ไม่มี `text-xs`)

---

## J. UXUI Regression (Quick scan)

ทุกหน้าหลัก: dashboard, billing, maintenance, settings, board, import

- [ ] ไม่มี browser `alert()` / `confirm()`
- [ ] Primary CTA สูง ~56px (`min-h-14`)
- [ ] Input/button สูง ≥ 48px (`min-h-12`)
- [ ] Empty state มีข้อความ + CTA (ไม่ blank)
- [ ] Error แดง inline ใต้ field
- [ ] ไม่มี shadow หนัก / geometry ไม่สอดคล้อง

---

## K. Production-only (หลัง deploy)

- [ ] Env VAPID ครบบน Vercel
- [ ] Migration 00031 บน prod DB
- [ ] ทด push บน production URL (ไม่ใช่ localhost)
- [ ] PWA ติดตั้งลง home screen → เปิดได้ (ไม่ crash)
- [ ] LIFF endpoint URL ตรงกับ production URL ใน LINE Console

---

## บันทึกผล

| Test | Pass / Fail | หมายเหตุ |
|------|-------------|----------|
| D — ส่งแจ้งซ่อม | | |
| E — Web push แจ้งซ่อม | | |
| E — Web push สลิป | | |
| F — Subscribe persist | | |
| C — โทรช่าง | | |
| B — Dashboard callouts | | |
| I — LIFF board | | |
| K — Production deploy | | |

---

## ลำดับทดแนะนำ

1. **Local:** A → C → D → G → H → J
2. **เปิด push:** F
3. **แจ้งเตือน:** E (หลัง F)
4. **LINE + Prod:** I → K

**Local vs Prod**

| ทด local (`build && start`) | ต้อง push prod |
|-----------------------------|----------------|
| A, B, C, D (dev tenant), G, H, J | E, F (มือถือ), I (LIFF), K |
