"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslations } from "next-intl";

interface PrintPatientCardProps {
  patientName: string;
  secureToken: string;
}

export function PrintPatientCard({
  patientName,
  secureToken,
}: PrintPatientCardProps) {
  const t = useTranslations("idcard");
  const badgeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const badge = badgeRef.current;
    if (!badge) return;
    const canvas = badge.querySelector<HTMLCanvasElement>("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `cognicare-${patientName
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()}-card.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* ID Badge — approximately 3×2 inches at 96dpi */}
      <div
        ref={badgeRef}
        className="mx-auto w-[300px] h-[200px] rounded-xl border-4 border-tea bg-white p-2 flex flex-col gap-1 print:border-2 print:shadow-none print:w-[288px] print:h-[192px]"
      >
        <div className="flex items-center justify-between px-1">
          <span className="font-[family-name:var(--font-serif)] font-bold text-sm text-tea tracking-wide">
            CogniCare
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-secondary">
            {t("badge.label").toUpperCase()}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-3 px-1 min-h-0">
          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-serif)] font-bold text-ink text-lg leading-tight break-words">
              {patientName}
            </p>
            <p className="text-[10px] font-bold text-ink-secondary mt-1.5">
              {t("badge.hint")}
            </p>
          </div>
          <div className="bg-surface-muted border-2 border-border rounded-md p-1 shrink-0">
            <QRCodeCanvas
              value={secureToken}
              size={92}
              level="M"
              marginSize={1}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1 border-t-2 border-border-soft pt-1 text-[9px] font-bold text-ink-secondary">
          <span>✦ {t("badge.footer")}</span>
          <span className="font-mono uppercase">
            {secureToken.slice(0, 10)}…
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <button
          onClick={handleDownload}
          className="btn-chunky btn-chunky-tea btn-chunky-xl"
        >
          ⬇ {t("download")}
        </button>
        <button onClick={handlePrint} className="btn-chunky btn-chunky-xl">
          🖨 {t("print")}
        </button>
      </div>
    </div>
  );
}