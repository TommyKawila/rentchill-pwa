import { LEGAL_UPDATED_AT } from "@/content/legal/version";
import type { LocalizedLegalDocument } from "@/content/legal/types";

export const privacyDocument: LocalizedLegalDocument = {
  th: {
    title: "นโยบายความเป็นส่วนตัว",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. ผู้เกี่ยวข้องกับข้อมูล",
        paragraphs: [
          "RentChill เป็นแพลตฟอร์มบริหารห้องเช่า ในบริบทการเช่าห้อง เจ้าของโครงการ/ผู้ให้เช่าเป็นผู้ควบคุมข้อมูลส่วนบุคคลของลูกบ้านสำหรับวัตถุประสงค์การปล่อยเช่า และ RentChill เป็นผู้ประมวลผล/ผู้ให้บริการระบบที่ประมวลผลข้อมูลตามคำสั่งของเจ้าของโครงการ",
          "ข้อมูลบัญชีเจ้าของ (อีเมล ชื่อ ข้อมูลการสมัครใช้บริการ) RentChill เป็นผู้ควบคุมข้อมูลเพื่อให้บริการแพลตฟอร์ม",
        ],
      },
      {
        title: "2. ข้อมูลที่เก็บรวบรวม",
        paragraphs: [
          "ลูกบ้าน: ชื่อ คำนำหน้า เบอร์โทร LINE user id รหัสเชิญ รูปสลิปการโอน ประวัติบิลและสถานะการชำระ รูปมิเตอร์/เอกสารที่เกี่ยวข้องกับการเช่าเมื่อมีการใช้งานฟีเจอร์นั้น",
          "เจ้าของ: ชื่อ อีเมล รหัสผ่าน (เก็บแบบ hash) ข้อมูลแผนการใช้งาน ข้อมูลติดต่อที่ตั้งค่าในระบบ และข้อมูลที่จำเป็นต่อการเรียกเก็บค่าบริการแพลตฟอร์ม",
          "ข้อมูลทางเทคนิคพื้นฐาน เช่น session cookie สำหรับเข้าสู่ระบบเจ้าของ และบันทึกเหตุการณ์ระบบเพื่อความปลอดภัย",
        ],
      },
      {
        title: "3. วัตถุประสงค์ในการใช้ข้อมูล",
        paragraphs: [
          "ออกบิลค่าเช่าและสาธารณูปโภค ตรวจสอบสลิป แจ้งเตือนการชำระ จัดการซ่อมบำรุง และอำนวยความสะดวกในการติดต่อระหว่างลูกบ้านกับผู้ให้เช่า",
          "ให้บริการแดชบอร์ดเจ้าของ จำกัดสิทธิ์ตามแผน และปรับปรุงความปลอดภัยของระบบ",
          "ปฏิบัติตามกฎหมายที่เกี่ยวข้องเมื่อจำเป็น",
        ],
      },
      {
        title: "4. ฐานในการประมวลผล",
        paragraphs: [
          "ความยินยอม (consent) สำหรับการเก็บและใช้ข้อมูลที่จำเป็นต่อการใช้งานบอร์ดลูกบ้านผ่าน LINE",
          "การปฏิบัติตามสัญญาหรือขั้นตอนก่อนทำสัญญาสำหรับบริการที่เจ้าของสมัครใช้",
          "ประโยชน์โดยชอบด้วยกฎหมายในการรักษาความปลอดภัยของระบบและการป้องกันการทุจริต โดยไม่กระทบสิทธิของเจ้าของข้อมูลเกินสมควร",
        ],
      },
      {
        title: "5. การเปิดเผยข้อมูล",
        paragraphs: [
          "เปิดเผยข้อมูลที่จำเป็นแก่เจ้าของโครงการที่เกี่ยวข้องกับห้องของลูกบ้าน",
          "อาจใช้ผู้ให้บริการโครงสร้างพื้นฐาน เช่น ฐานข้อมูล โฮสติ้ง และการส่งข้อความ (เช่น LINE) ภายใต้ข้อตกลงที่เหมาะสม",
          "ไม่ขายข้อมูลส่วนบุคคล และไม่เปิดเผยแก่บุคคลที่สามเพื่อการตลาดที่ไม่เกี่ยวข้อง เว้นแต่ได้รับความยินยอมหรือกฎหมายกำหนด",
        ],
      },
      {
        title: "6. ระยะเวลาการเก็บรักษา",
        paragraphs: [
          "เก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการและการปฏิบัติตามกฎหมาย เช่น ข้อมูลบิลและสลิปในช่วงที่มีความสัมพันธ์การเช่าและระยะเวลาตรวจสอบที่สมเหตุสมผลหลังจากนั้น",
          "เมื่อลบบัญชีหรือสิ้นสุดการใช้งาน ข้อมูลจะถูกลบหรือทำให้ระบุตัวตนไม่ได้ตามกระบวนการของระบบ เว้นแต่ต้องเก็บตามกฎหมาย",
        ],
      },
      {
        title: "7. สิทธิของเจ้าของข้อมูล",
        paragraphs: [
          "ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ ระงับใช้ คัดค้าน และถอนความยินยอม รวมถึงร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคลตามที่กฎหมายกำหนด",
          "การถอนความยินยอมอาจทำให้ไม่สามารถใช้บางฟีเจอร์ของระบบได้ เช่น การดูบิลหรือส่งสลิปผ่าน LINE",
        ],
      },
      {
        title: "8. ช่องทางติดต่อ",
        paragraphs: [
          "หากต้องการใช้สิทธิหรือสอบถามเรื่องข้อมูลส่วนบุคคล กรุณาติดต่อผ่านหน้า Contact ของ RentChill",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. Roles",
        paragraphs: [
          "RentChill is a rental management platform. For tenancy operations, the property owner/landlord is the data controller for tenant data, and RentChill acts as a processor/service provider processing data on the owner's instructions.",
          "For owner accounts (email, name, subscription data), RentChill is the controller to provide the platform service.",
        ],
      },
      {
        title: "2. Data we collect",
        paragraphs: [
          "Tenants: name, title, phone number, LINE user id, invite code, payment slip images, invoice/payment history, and meter/document media when those features are used.",
          "Owners: name, email, hashed password, plan usage data, configured contact details, and data needed for platform billing.",
          "Basic technical data such as owner session cookies and security logs.",
        ],
      },
      {
        title: "3. Purposes",
        paragraphs: [
          "Issue rent/utility bills, verify slips, send payment reminders, handle maintenance, and facilitate landlord–tenant communication.",
          "Provide the owner dashboard, enforce plan limits, and maintain system security.",
          "Comply with applicable law when required.",
        ],
      },
      {
        title: "4. Legal bases",
        paragraphs: [
          "Consent for tenant board use via LINE where required.",
          "Contract performance (or pre-contract steps) for owner subscriptions.",
          "Legitimate interests for security and fraud prevention, balanced against data subject rights.",
        ],
      },
      {
        title: "5. Disclosure",
        paragraphs: [
          "Shared as needed with the relevant property owner for that tenant's rooms.",
          "Infrastructure providers (database, hosting, messaging such as LINE) may process data under appropriate arrangements.",
          "We do not sell personal data or share it for unrelated marketing without consent or legal requirement.",
        ],
      },
      {
        title: "6. Retention",
        paragraphs: [
          "Kept only as long as needed for the service and legal obligations, including a reasonable period after a tenancy ends for billing records and slips.",
          "On account deletion or end of service, data is deleted or de-identified according to system processes unless retention is legally required.",
        ],
      },
      {
        title: "7. Your rights",
        paragraphs: [
          "You may request access, correction, deletion, restriction, objection, and withdrawal of consent, and may lodge a complaint with the Thai PDPA authority as applicable.",
          "Withdrawing consent may limit features such as viewing bills or submitting slips via LINE.",
        ],
      },
      {
        title: "8. Contact",
        paragraphs: [
          "For privacy requests, please use RentChill’s Contact page.",
        ],
      },
    ],
  },
};
