import { CheckCircle2, FilePlus2, FileSearch, History, Pencil, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/admission/format";
import type { Application, TimelineKind } from "@/lib/admission/types";
import { InfoCard } from "./info-grid";

const KIND: Record<TimelineKind, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  submitted: { icon: FilePlus2, tone: "bg-primary/10 text-primary" },
  documents: { icon: ShieldCheck, tone: "bg-info/15 text-info" },
  review: { icon: FileSearch, tone: "bg-info/15 text-info" },
  updated: { icon: Pencil, tone: "bg-muted text-muted-foreground" },
  approved: { icon: CheckCircle2, tone: "bg-success/15 text-success" },
  rejected: { icon: XCircle, tone: "bg-destructive/15 text-destructive" },
};

export function TimelineCard({ app }: { app: Application }) {
  const events = [...app.timeline].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <InfoCard title="Application Timeline" icon={History}>
      <ol className="relative space-y-5">
        <span className="absolute top-2 bottom-2 left-4 w-px bg-border" aria-hidden />
        {events.map((e) => {
          const k = KIND[e.kind];
          return (
            <li key={e.id} className="relative flex gap-3.5">
              <span className={cn("z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card", k.tone)}>
                <k.icon className="size-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="text-sm font-medium">{e.title}</div>
                {e.description && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{e.description}</p>}
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {formatDateTime(e.at)} · {e.by}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </InfoCard>
  );
}
