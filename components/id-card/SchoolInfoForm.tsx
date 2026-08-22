"use client";

import { SchoolInfo } from "@/lib/types";

interface Props {
  school: SchoolInfo;
  onChange: (next: SchoolInfo) => void;
}

const FIELDS: { key: keyof SchoolInfo; label: string }[] = [
  { key: "name", label: "School name" },
  { key: "tagline", label: "Tagline" },
  { key: "sessionLabel", label: "Session" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "website", label: "Website" },
  { key: "signatureLabel", label: "Signatory title" },
];

export function SchoolInfoForm({ school, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map((f) => (
        <div key={f.key} className={f.key === "address" ? "col-span-2" : ""}>
          <label className="mb-1 block text-xs font-medium text-ink-600">{f.label}</label>
          <input
            value={school[f.key] as string}
            onChange={(e) => onChange({ ...school, [f.key]: e.target.value })}
            className="w-full rounded-md border border-ink-200 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </div>
      ))}
    </div>
  );
}
