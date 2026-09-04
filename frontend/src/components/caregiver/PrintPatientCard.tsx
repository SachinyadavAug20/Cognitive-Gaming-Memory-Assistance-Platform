"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { Download, Printer, Loader2 } from "lucide-react";

interface PrintPatientCardProps {
  patientName: string;
  secureToken: string;
}

const W = 300;
const H = 200;
const SCALE = 3;
const CARD_W = W * SCALE;
const CARD_H = H * SCALE;

export function PrintPatientCard({
  patientName,
  secureToken,
}: PrintPatientCardProps) {
  const t = useTranslations("idcard");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [busy, setBusy] = useState(false);

  const rasterizeCard = async (): Promise<string | null> => {
    const svg = svgRef.current;
    if (!svg) return null;
    const source = new XMLSerializer().serializeToString(svg);
    const encoded = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("failed to load svg"));
      img.src = encoded;
    });

    const canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.drawImage(img, 0, 0, CARD_W, CARD_H);
    return canvas.toDataURL("image/png");
  };

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const dataUrl = await rasterizeCard();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `cognicare-${patientName
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}-card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const dataUrl = await rasterizeCard();
      if (!dataUrl) return;

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument;
      if (!doc) {
        document.body.removeChild(iframe);
        return;
      }
      doc.write(`<!doctype html><html><head><title></title><style>
        @page { margin: 8mm; }
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #ffffff; }
        img { width: 300px; image-rendering: crisp-edges; }
      </style></head><body></body></html>`);
      doc.close();

      const img = new Image();
      img.style.display = "block";
      img.src = dataUrl;
      doc.body.appendChild(img);

      const win = iframe.contentWindow;
      if (!win) {
        document.body.removeChild(iframe);
        return;
      }
      const afterPrint = () => document.body.removeChild(iframe);
      win.onafterprint = afterPrint;
      setTimeout(() => {
        win.focus();
        win.print();
      }, 300);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* ID Badge — 300×200 design at 3x export resolution */}
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        width="300"
        height="200"
        viewBox="0 0 300 200"
        className="mx-auto block w-full max-w-[300px] rounded-xl"
        role="img"
        aria-label="CogniCare Patient ID Card"
      >
        {/* Card surface */}
        <rect x="0" y="0" width="300" height="200" rx="16" ry="16" fill="#fff" />
        {/* Tea border */}
        <rect
          x="3"
          y="3"
          width="294"
          height="194"
          rx="13"
          ry="13"
          fill="none"
          stroke="#1b4d3e"
          strokeWidth="5"
        />

        {/* Header row */}
        <text
          x="16"
          y="26"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="13"
          fill="#1b4d3e"
        >
          CogniCare
        </text>
        <text
          x="284"
          y="26"
          textAnchor="end"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="10"
          letterSpacing="2"
          fill="#4a4131"
        >
          {t("badge.label").toUpperCase()}
        </text>

        {/* Middle: name + hint (left) and QR (right) */}
        <text
          x="16"
          y="96"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="19"
          fill="#1a1611"
        >
          {patientName}
        </text>
        <text
          x="16"
          y="116"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="10"
          fill="#6a5c40"
        >
          {t("badge.hint")}
        </text>

        {/* QR code */}
        <g transform="translate(186, 40)">
          <QRCodeSVG
            value={secureToken}
            size={100}
            level="M"
            marginSize={1}
          />
        </g>

        {/* Footer */}
        <line x1="12" y1="166" x2="288" y2="166" stroke="#4a4131" strokeWidth="2" />
        <text
          x="16"
          y="184"
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="#6a5c40"
        >
          {t("badge.footer")}
        </text>
        <text
          x="284"
          y="184"
          textAnchor="end"
          fontFamily="monospace"
          fontWeight="700"
          fontSize="9"
          letterSpacing="1"
          fill="#6a5c40"
        >
          {secureToken.slice(0, 10).toUpperCase()}…
        </text>
      </svg>

      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="btn-chunky btn-chunky-tea btn-chunky-xl inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span>{t("download")}</span>
        </button>
        <button
          onClick={handlePrint}
          disabled={busy}
          className="btn-chunky btn-chunky-xl inline-flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          <span>{t("print")}</span>
        </button>
      </div>
    </div>
  );
}