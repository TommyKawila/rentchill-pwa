import * as XLSX from "xlsx";
import type { AnalyticsReport } from "@/services/analyticsCashflowService";

const CATEGORY_LABEL: Record<string, string> = {
  ac: "แอร์",
  plumbing: "ระบบน้ำ",
  electrical: "ไฟฟ้า",
  furniture: "เฟอร์นิเจอร์",
  other: "อื่นๆ",
};

export function buildAnalyticsWorkbook(report: AnalyticsReport) {
  const summarySheet = [
    ["รายการ", "จำนวน (บาท)"],
    ["รายรับรวม", report.summary.grossRevenue],
    ["รายจ่ายรวม", report.summary.totalExpenses],
    ["กำไรสุทธิ", report.summary.netProfit],
    ["อัตราการเช่า (%)", report.summary.occupancyRate],
  ];

  const monthlySheet = [
    ["เดือน", "รายรับ", "รายจ่าย", "กำไรสุทธิ"],
    ...report.monthly.map((row) => [
      row.month,
      row.revenue,
      row.expense,
      row.revenue - row.expense,
    ]),
  ];

  const categorySheet = [
    ["หมวด", "จำนวน (บาท)", "สัดส่วน (%)"],
    ...report.expenseByCategory.map((row) => [
      CATEGORY_LABEL[row.category] ?? row.category,
      row.amount,
      row.pct,
    ]),
  ];

  const topRoomsSheet = [
    ["โครงการ", "ห้อง", "รายรับ", "รายจ่าย", "กำไรสุทธิ"],
    ...report.topRooms.map((row) => [
      row.propertyName,
      row.roomNumber,
      row.revenue,
      row.expense,
      row.netProfit,
    ]),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), "สรุป");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthlySheet), "รายเดือน");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(categorySheet),
    "รายจ่ายตามหมวด",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(topRoomsSheet),
    "ห้องทำกำไรสูงสุด",
  );

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const year = new Date().getFullYear();
  return {
    buffer,
    filename: `rentchill-analytics-${report.timeframe}-${year}.xlsx`,
  };
}
