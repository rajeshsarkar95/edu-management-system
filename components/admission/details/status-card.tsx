import { CalendarClock, ShieldQuestion } from "lucide-react";
import { StatusBadge } from "@/components/admission/status-badge";
import { formatDate, formatDateTime } from "@/lib/admission/format";
import type { Application } from "@/lib/admission/types";
import { InfoCard } from "./info-grid";

const COPY = {
  pending: "Awaiting initial document verification by the admissions office.",
  under_review: "Documents verified. The department is evaluating this application.",
  approved: "Admission has been offered to the student.",
  rejected: "This application was not accepted.",
} as const;

export function StatusCard({ app }: { app: Application }) {
  return (
    <InfoCard title="Admission Status" icon={ShieldQuestion}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={app.status} />
          <span className="font-mono text-xs text-muted-foreground">{app.id}</span>
        </div>
        <p className="text-sm text-muted-foreground">{COPY[app.status]}</p>
        <dl className="space-y-3 rounded-lg bg-muted/60 p-3.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Applied on</dt>
            <dd className="font-medium">{formatDate(app.applicationDate)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Decision on</dt>
            <dd className="font-medium">{app.decidedAt ? formatDateTime(app.decidedAt) : "—"}</dd>
          </div>
        </dl>
        {app.remarks && (
          <div className="rounded-lg border bg-card p-3.5">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <CalendarClock className="size-3.5" /> Remarks
            </div>
            <p className="text-sm">{app.remarks}</p>
          </div>
        )}
      </div>
    </InfoCard>
  );
}
