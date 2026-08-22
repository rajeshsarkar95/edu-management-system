"use client";

import clsx from "clsx";
import { TEMPLATES } from "./TemplateRegistry";
import { CodeType, TemplateId } from "@/lib/types";

interface Props {
  templateId: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  codeType: CodeType;
  onCodeTypeChange: (t: CodeType) => void;
  side: "front" | "back";
  onSideChange: (s: "front" | "back") => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  isExporting: boolean;
}

export function Toolbar({
  templateId,
  onTemplateChange,
  codeType,
  onCodeTypeChange,
  side,
  onSideChange,
  onPrint,
  onDownloadPdf,
  isExporting,
}: Props) {
  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplateChange(t.id)}
              title={t.blurb}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                templateId === t.id
                  ? "bg-ink-900 text-white"
                  : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="h-5 w-px bg-ink-100" />
        <div className="flex items-center gap-1.5">
          {(["front", "back"] as const).map((s) => (
            <button
              key={s}
              onClick={() => onSideChange(s)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition",
                side === s ? "bg-accent text-white" : "bg-ink-50 text-ink-600 hover:bg-ink-100"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-ink-100" />

        <select
          value={codeType}
          onChange={(e) => onCodeTypeChange(e.target.value as CodeType)}
          className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-700"
        >
          <option value="qr">QR code</option>
          <option value="barcode">Barcode</option>
          <option value="none">No code</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
        >
          Print
        </button>
        <button
          onClick={onDownloadPdf}
          disabled={isExporting}
          className="rounded-md bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isExporting ? "Preparing PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
