import { LEGAL_UPDATED_AT } from "@/content/legal/version";
import type { LocalizedLegalDocument } from "@/content/legal/types";

export const termsDocument: LocalizedLegalDocument = {
  th: {
    title: "ข้อกำหนดการใช้บริการ",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. การยอมรับข้อกำหนด",
        paragraphs: [
          "การใช้บริการ RentChill ถือว่าท่านยอมรับข้อกำหนดนี้ หากไม่ยอมรับ กรุณาหยุดใช้บริการ",
        ],
      },
      {
        title: "2. บทบาทของแพลตฟอร์ม",
        paragraphs: [
          "RentChill ให้เครื่องมือออกบิล ตรวจสลิป แจ้งเตือน และจัดการการดำเนินงานเช่า",
          "ความสัมพันธ์การเช่าระหว่างเจ้าของกับลูกบ้านเป็นความรับผิดชอบของคู่สัญญาโดยตรง RentChill ไม่ใช่คู่สัญญาเช่าและไม่รับประกันการชำระค่าเช่า",
        ],
      },
      {
        title: "3. บัญชีและการใช้งาน",
        paragraphs: [
          "เจ้าของต้องรักษาความลับของบัญชีและรหัสผ่าน และรับผิดชอบกิจกรรมภายใต้บัญชีของตน",
          "ลูกบ้านเข้าใช้งานผ่าน LINE ตามลิงก์/รหัสเชิญที่เจ้าของจัดให้ และต้องให้ข้อมูลที่ถูกต้อง",
          "ห้ามใช้ระบบในทางที่ผิดกฎหมาย รบกวนบริการ หรือละเมิดสิทธิผู้อื่น",
        ],
      },
      {
        title: "4. แผนและค่าบริการ",
        paragraphs: [
          "ฟีเจอร์และโควต้าขึ้นกับแผนที่ใช้งาน (เช่น Free / Premium) ตามที่แสดงในหน้าบริการ",
          "การอัปเกรด ต่ออายุ หรือยกเลิกเป็นไปตามเงื่อนไขที่ระบุในหน้าชำระเงิน/แผน",
        ],
      },
      {
        title: "5. เนื้อหาและข้อมูลที่อัปโหลด",
        paragraphs: [
          "ท่านรับรองว่ามีสิทธิอัปโหลดข้อมูลและไฟล์ที่ส่งเข้าสู่ระบบ และไม่ละเมิดกฎหมายหรือสิทธิบุคคลที่สาม",
          "RentChill อาจลบเนื้อหาที่ละเมิดข้อกำหนดหรือกฎหมายโดยไม่ต้องแจ้งล่วงหน้าเมื่อจำเป็นเพื่อความปลอดภัยของระบบ",
        ],
      },
      {
        title: "6. ข้อจำกัดความรับผิด",
        paragraphs: [
          "บริการให้ตามสภาพที่เป็น (as available) อาจมีการหยุดชะงักหรือข้อผิดพลาดทางเทคนิค",
          "ในขอบเขตที่กฎหมายอนุญาต RentChill ไม่รับผิดต่อความเสียหายทางอ้อม กำไรที่สูญเสีย หรือความเสียหายที่เป็นผลสืบเนื่องจากการใช้หรือไม่สามารถใช้บริการ",
        ],
      },
      {
        title: "7. การเปลี่ยนแปลงข้อกำหนด",
        paragraphs: [
          "เราอาจอัปเดตข้อกำหนดนี้เป็นครั้งคราว โดยแสดงวันที่อัปเดตล่าสุดบนหน้านี้ การใช้บริการต่อหลังจากมีการเปลี่ยนแปลงถือว่ายอมรับข้อกำหนดฉบับใหม่",
        ],
      },
      {
        title: "8. ติดต่อ",
        paragraphs: [
          "สอบถามเรื่องข้อกำหนดการใช้บริการได้ที่หน้า Contact",
        ],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updatedAt: LEGAL_UPDATED_AT,
    sections: [
      {
        title: "1. Acceptance",
        paragraphs: [
          "By using RentChill you agree to these Terms. If you do not agree, please stop using the service.",
        ],
      },
      {
        title: "2. Platform role",
        paragraphs: [
          "RentChill provides tools for billing, slip verification, reminders, and rental operations.",
          "The tenancy relationship is solely between landlord and tenant. RentChill is not a party to the lease and does not guarantee rent payment.",
        ],
      },
      {
        title: "3. Accounts and use",
        paragraphs: [
          "Owners must keep credentials confidential and are responsible for activity under their account.",
          "Tenants access via LINE using invite links/codes provided by the owner and must provide accurate information.",
          "Do not use the service unlawfully, disrupt the service, or infringe others’ rights.",
        ],
      },
      {
        title: "4. Plans and fees",
        paragraphs: [
          "Features and quotas depend on the plan (e.g. Free / Premium) as shown on the service pages.",
          "Upgrades, renewals, and cancellations follow the billing/plan terms shown in-product.",
        ],
      },
      {
        title: "5. Uploaded content",
        paragraphs: [
          "You warrant you have rights to upload data and files and that they do not violate law or third-party rights.",
          "RentChill may remove content that violates these Terms or law when needed for system safety.",
        ],
      },
      {
        title: "6. Limitation of liability",
        paragraphs: [
          "The service is provided as available and may experience interruptions or technical errors.",
          "To the extent permitted by law, RentChill is not liable for indirect, lost profits, or consequential damages arising from use or inability to use the service.",
        ],
      },
      {
        title: "7. Changes",
        paragraphs: [
          "We may update these Terms from time to time and show the latest update date on this page. Continued use after changes means you accept the updated Terms.",
        ],
      },
      {
        title: "8. Contact",
        paragraphs: [
          "Questions about these Terms can be sent via the Contact page.",
        ],
      },
    ],
  },
};
