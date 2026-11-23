"use client";

import * as React from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admission/confirm-dialog";
import { useAdmissions } from "@/lib/admission/store";
import type { Application } from "@/lib/admission/types";

type Kind = "approve" | "reject" | "delete";

/**
 * Shared approve / reject / delete / mark-under-review behaviour.
 * Render `dialogs` once on the page and call the returned handlers from buttons or menus.
 */
export function useApplicationActions({ onDeleted }: { onDeleted?: (app: Application) => void } = {}) {
  const { setStatus, remove, restore } = useAdmissions();
  const [target, setTarget] = React.useState<{ kind: Kind; app: Application } | null>(null);
  const [open, setOpen] = React.useState(false);

  const ask = (kind: Kind) => (app:Application) => {
    setTarget({ kind, app });
    setOpen(true);
  };

  const markUnderReview = (app: Application) => {
    setStatus(app.id, "under_review");
    toast.info(`${app.fullName} moved to review`, { description: app.id });
  };

  function handleConfirm(remark?: string) {
    if (!target) return;
    const { kind, app } = target;
    if (kind === "approve") {
      setStatus(app.id, "approved", remark);
      toast.success("Admission approved", {description:`${app.fullName} (${app.id}) has been approved.` });
    } else if (kind === "reject") {
      setStatus(app.id, "rejected", remark);
      toast.error("Application rejected", { description: `${app.fullName} (${app.id}) has been rejected.` });
    } else {
      remove(app.id);
      onDeleted?.(app);
      toast.success("Application deleted",{
        description: `${app.fullName} (${app.id}) was removed.`,
        action: { label: "Undo", onClick: () => { restore(app); toast.success("Application restored"); } },
      });
    }
  }

  const k = target?.kind;
  const name = target?.app.fullName ?? "";
  const dialogs = (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      tone={k === "approve" ? "success" : "destructive"}
      title={k === "approve" ? "Approve admission?" : k === "reject" ? "Reject application?" : "Delete application?"}
      description={
        k === "approve" ? (
          <>
            <strong className="text-foreground">{name}</strong> will be marked as admitted to {target?.app.course}. You can change the decision later.
          </>
        ) : k === "reject" ? (
          <>
            <strong className="text-foreground">{name}</strong>&apos;s application will be marked as rejected. You can add a reason below.
          </>
        ) : (
          <>
            This permanently removes <strong className="text-foreground">{name}</strong>&apos;s application ({target?.app.id}) and its history. You&apos;ll have a few seconds to undo.
          </>
        )
      }
      confirmLabel={k === "approve" ? "Approve" : k === "reject" ? "Reject" : "Delete"}
      withRemark={k === "approve" || k === "reject"}
      remarkLabel={k === "reject" ? "Reason for rejection (required)" : "Remarks (optional)"}
      remarkRequired={k === "reject"}
      onConfirm={handleConfirm}
    />
  );

  return { approve: ask("approve"), reject: ask("reject"), remove: ask("delete"), markUnderReview, dialogs };
}
