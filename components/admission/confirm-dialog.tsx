"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  tone?: "default" | "success" | "destructive";
  /** Show an optional remark box; its value is passed to onConfirm. */
  withRemark?: boolean;
  remarkLabel?: string;
  remarkRequired?: boolean;
  onConfirm: (remark?: string) => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  tone,
  withRemark,
  remarkLabel = "Remarks (optional)",
  remarkRequired,
  onConfirm,
}: ConfirmDialogProps) {
  const [remark, setRemark] = React.useState("");
  const resolvedTone = tone ?? (destructive ? "destructive" : "default");
  const Icon = resolvedTone === "success" ? CheckCircle2 : resolvedTone === "destructive" ? (title.toLowerCase().includes("reject") ? XCircle : AlertTriangle) : AlertTriangle;
  const blocked = Boolean(withRemark && remarkRequired && !remark.trim());

  React.useEffect(() => {
    if (!open) setRemark("");
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={cn(
              "mb-1 flex size-11 items-center justify-center rounded-full",
              resolvedTone === "success" && "bg-success/15 text-success",
              resolvedTone === "destructive" && "bg-destructive/15 text-destructive",
              resolvedTone === "default" && "bg-warning/15 text-warning",
            )}
          >
            <Icon className="size-5" />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {withRemark && (
          <div className="space-y-2">
            <Label htmlFor="confirm-remark">{remarkLabel}</Label>
            <Textarea id="confirm-remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Add a note for the applicant record…" rows={3} />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={blocked}
            onClick={() => onConfirm(withRemark ? remark.trim() || undefined : undefined)}
            className={cn(
              resolvedTone === "destructive" && "bg-destructive text-white hover:bg-destructive/90",
              resolvedTone === "success" && "bg-success text-white hover:bg-success/90",
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
