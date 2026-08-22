"use client";

import { useRef } from "react";

interface Props {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}

export function PhotoUpload({ value, onChange, label = "Photo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md border border-ink-200 bg-ink-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-400">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-600">{label}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-ink-400 hover:bg-ink-50"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
