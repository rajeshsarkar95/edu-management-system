"use client";

import { useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import JsBarcode from "jsbarcode";
import { CodeType } from "@/lib/types";

interface CodeBlockProps {
  type: CodeType;
  value: string;
  size?: number; // px, qr only
  fg?: string;
  bg?: string;
}

export function CodeBlock({ type, value, size = 64, fg = "#12151C", bg = "#ffffff" }: CodeBlockProps) {
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (type === "barcode" && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, value || "0000000000", {
          format: "CODE128",
          displayValue: false,
          height: 28,
          width: 1.4,
          margin: 0,
          background: "transparent",
          lineColor: fg,
        });
      } catch {
        // invalid characters for the symbology — leave blank rather than crash the card
      }
    }
  }, [type, value, fg]);

  if (type === "none") return null;

  if (type === "barcode") {
    return <svg ref={barcodeRef} className="h-7 w-full" />;
  }

  return (
    <div className="inline-block rounded" style={{ background: bg, padding: 4 }}>
      <QRCode value={value || "N/A"} size={size} fgColor={fg} bgColor={bg} />
    </div>
  );
}
