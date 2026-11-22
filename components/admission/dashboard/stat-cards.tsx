"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock, FileSearch, FileText, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Application } from "@/lib/admission/types";

const CARDS = [
  { key: "total", label: "Total Applications", icon: FileText, href: "/admission/applications", tone: "text-primary bg-primary/10" },
  { key: "pending", label: "Pending Applications", icon: Clock, href: "/admission/applications?status=pending", tone: "text-warning bg-warning/15" },
  { key: "under_review", label: "Under Review", icon: FileSearch, href: "/admission/applications?status=under_review", tone: "text-info bg-info/15" },
  { key: "approved", label: "Approved Admissions", icon: CheckCircle2, href: "/admission/applications?status=approved", tone: "text-success bg-success/15" },
  { key: "rejected", label: "Rejected Applications", icon: XCircle, href: "/admission/applications?status=rejected", tone: "text-destructive bg-destructive/15" },
] as const;

export function StatCards({ apps, loading }: { apps: Application[]; loading?: boolean }) {
  const total = apps.length;
  const count = (k: string) => (k === "total" ? total : apps.filter((a) => a.status === k).length);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {CARDS.map((c, i) =>{
        const n = count(c.key);
        const pct = total ? Math.round((n / total) * 100) : 0;
        return (
          <Link
            key={c.key}
            href={c.href}
            className={cn("group block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", i === 0 && "sm:col-span-2 xl:col-span-1")}
          >
            <Card className="h-full gap-3 py-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="flex items-start justify-between px-5">
                <div className={cn("flex size-10 items-center justify-center rounded-xl", c.tone)}>
                  <c.icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </div>
              <div className="px-5">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-semibold tracking-tight tabular-nums">{n}</div>
                )}
                <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
              </div>
              <div className="px-5">
                {loading ? (
                  <Skeleton className="h-3 w-24" />
                ) : c.key === "total" ? (
                  <span className="text-xs text-muted-foreground">All sessions & courses</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", c.tone.split(" ")[0].replace("text-", "bg-"))} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
