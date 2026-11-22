"use client";

import * as React from "react";
import { FileText, ImageIcon, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_DOC_TYPES, ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/admission/constants";
import { formatFileSize } from "@/lib/admission/format";
import type { FileMeta } from "@/lib/admission/schema";
import { cn } from "@/lib/utils";

/** Downscale to a small JPEG data URL so the demo can persist photos in localStorage. */
function toThumbnail(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    img.src = url;
  });
}

interface FileUploadProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  value: FileMeta | null;
  onChange: (v: FileMeta | null) => void;
  error?: string;
  /** Image-only field with a round preview (used for the student photograph). */
  variant?: "photo" | "document";
}

export function FileUpload({ id, label, hint, required, value, onChange, error, variant = "document" }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const accepted = variant === "photo" ? ACCEPTED_IMAGE_TYPES : ACCEPTED_DOC_TYPES;
  const acceptLabel = variant === "photo" ? "JPG, PNG or WebP" : "PDF, JPG or PNG";

  async function handle(file?: File) {
    if (!file) return;
    setLocalError(null);
    if (!accepted.includes(file.type)) return setLocalError(`Unsupported file type. Use ${acceptLabel}.`);
    if (file.size > MAX_FILE_SIZE) return setLocalError("File is larger than 5 MB.");
    setBusy(true);
    try {
      const meta: FileMeta = { name: file.name, size: file.size, type: file.type };
      if (variant === "photo") meta.dataUrl = await toThumbnail(file);
      onChange(meta);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const shownError = localError || error;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label} {required ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(optional)</span>}
        </label>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accepted.join(",")}
        onChange={(e) => handle(e.target.files?.[0])}
        data-testid={id}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
          {variant === "photo" && value.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.dataUrl} alt="Student photograph preview" className="size-16 rounded-xl object-cover" />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              {value.type.startsWith("image/") ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{value.name}</div>
            <div className="text-xs text-muted-foreground">{formatFileSize(value.size)}</div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <RefreshCw /> Replace
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${label}`}
            onClick={() => {
              onChange(null);
              setLocalError(null);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handle(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed bg-card px-4 py-6 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none",
            dragging && "border-primary bg-accent/60",
            shownError && "border-destructive/60",
          )}
        >
          <UploadCloud className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">{busy ? "Processing…" : "Click to upload or drag & drop"}</span>
          <span className="text-xs text-muted-foreground">{hint ? `${hint} · ` : ""}{acceptLabel}, max 5 MB</span>
        </button>
      )}
      {shownError && (
        <p role="alert" className="text-xs text-destructive">
          {shownError}
        </p>
      )}
    </div>
  );
}
