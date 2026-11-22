"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/admission/states";
import { BarChart3 } from "lucide-react";
import type { Application } from "@/lib/admission/types";

const SERIES = [
  { key: "approved", label: "Approved", color: "var(--chart-3)" },
  { key: "under_review", label: "Under Review", color: "var(--chart-2)" },
  { key: "pending", label: "Pending", color: "var(--chart-1)" },
  { key: "rejected", label: "Rejected", color: "var(--chart-4)" },
] as const;

function buildMonths(apps: Application[], months = 6) {
  const now = new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      approved: 0,
      under_review: 0,
      pending: 0,
      rejected: 0,
    };
  });
  for (const a of apps) {
    const d = new Date(a.applicationDate);
    const b = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (b) b[a.status]++;
  }
  return buckets;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="rounded-lg border bg-popover px-3 py-2.5 text-xs shadow-lg">
      <div className="mb-1.5 font-semibold text-popover-foreground">
        {label} · {total} applications
      </div>
      {SERIES.map((s) => {
        const v = payload.find((p) => p.dataKey === s.key)?.value ?? 0;
        return (
          <div key={s.key} className="flex items-center justify-between gap-6 py-0.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-medium tabular-nums">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AdmissionChart({ apps, loading }: { apps: Application[]; loading?: boolean }) {
  const data = React.useMemo(() => buildMonths(apps), [apps]);
  const empty = !loading && apps.length === 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Admission statistics</CardTitle>
          <CardDescription>Applications received per month, by status</CardDescription>
        </div>
        <div className="hidden flex-wrap justify-end gap-x-4 gap-y-1 sm:flex">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : empty ? (
          <EmptyState icon={BarChart3} title="No data to chart yet" description="Applications will show up here as they are received." />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.6 }} content={<ChartTooltip />} />
                {SERIES.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    stackId="a"
                    fill={s.color}
                    radius={i === SERIES.length - 1 ? [5, 5, 0, 0] : 0}
                    maxBarSize={44}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
