"use client";

import { useLocale } from "@/components/LocaleProvider";

interface RoomInviteQrSkinProps {
  roomNumber: string;
  tenantName: string;
  inviteUrl: string;
}

export function RoomInviteQrSkin({
  roomNumber,
  tenantName,
  inviteUrl,
}: RoomInviteQrSkinProps) {
  const { t } = useLocale();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(inviteUrl)}`;

  const handlePrint = () => {
    const popup = window.open("", "_blank", "width=480,height=640");
    if (!popup) return;

    popup.document.write(`<!DOCTYPE html>
<html><head><title>RentChill QR</title>
<style>
  body { font-family: system-ui, sans-serif; text-align: center; padding: 32px; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  p { margin: 4px 0; color: #52525b; }
  img { margin: 24px auto; display: block; }
</style></head><body>
  <h1>RentChill</h1>
  <p><strong>${t("owner.qr.room", { number: roomNumber })}</strong></p>
  <p>${tenantName}</p>
  <img id="qr" src="${qrSrc}" width="240" height="240" alt="${t("owner.qr.alt")}" />
  <p style="font-size:12px">${t("owner.qr.scanHint")}</p>
</body></html>`);
    popup.document.close();

    const img = popup.document.getElementById("qr");
    const printAndClose = () => {
      popup.focus();
      popup.print();
      popup.addEventListener("afterprint", () => popup.close(), { once: true });
    };

    if (img instanceof HTMLImageElement && !img.complete) {
      img.onload = printAndClose;
      img.onerror = printAndClose;
    } else {
      printAndClose();
    }
  };

  return (
    <div className="mt-2 rounded-md border border-zinc-200 bg-white p-3">
      <p className="text-xs font-medium text-zinc-700">{t("owner.qr.title")}</p>
      <div className="mt-2 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt={t("owner.qr.alt")}
          width={72}
          height={72}
          className="rounded border border-zinc-200"
        />
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 rounded-md border border-zinc-300 bg-zinc-50 py-2 text-xs font-medium text-zinc-800"
        >
          {t("owner.qr.print")}
        </button>
      </div>
    </div>
  );
}
