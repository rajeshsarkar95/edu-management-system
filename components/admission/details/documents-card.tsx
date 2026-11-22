"use client";

import * as React from "react";
import { FileCheck2, FileImage, FileText, FileX2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DOCUMENT_KEYS, DOCUMENT_META } from "@/lib/admission/constants";
import { formatFileSize } from "@/lib/admission/format";
import type { FileMeta } from "@/lib/admission/schema";
import type { Application } from "@/lib/admission/types";
import { InfoCard } from "./info-grid";

export function DocumentsCard({ app }: { app: Application }) {
  const [preview, setPreview] = React.useState<{ label: string; file: FileMeta } | null>(null);

  const rows: { key: string; label: string; required: boolean; file: FileMeta | null }[] = [
    { key: "photo", label: "Student Photograph", required: true, file: app.photo },
    ...DOCUMENT_KEYS.map((k) => ({ key: k, label: DOCUMENT_META[k].label, required: DOCUMENT_META[k].required, file: app[k] })),
  ];

  function open(label: string, file: FileMeta) {
    if (file.dataUrl) setPreview({ label, file });
    else toast.info("Preview isn't available in demo mode", { description: "File previews will work once uploads are connected to storage." });
  }

  return (
    <>
      <InfoCard title="Uploaded Documents" icon={Paperclip}>
        <ul className="divide-y rounded-lg border">
          {rows.map(({ key, label, required, file }) => {
            const isImage = file?.type.startsWith("image/");
            const Icon = !file ? FileX2 : isImage ? FileImage : FileText;
            return (
              <li key={key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${file ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {label}
                    {!required && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{file ? `${file.name} · ${formatFileSize(file.size)}` : "Not provided"}</div>
                </div>
                {file ? (
                  <>
                    <Badge variant="default">
                      <FileCheck2 /> Uploaded
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => open(label, file)}>
                      View
                    </Button>
                  </>
                ) : (
                  <Badge variant={required ? "destructive" : "secondary"}>{required ? "Missing" : "Not submitted"}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </InfoCard>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{preview?.label}</DialogTitle>
            <DialogDescription>{preview ? `${preview.file.name} · ${formatFileSize(preview.file.size)}` : ""}</DialogDescription>
          </DialogHeader>
          {preview?.file.dataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview.file.dataUrl} alt={preview.label} className="max-h-[60vh] w-full rounded-lg border object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
