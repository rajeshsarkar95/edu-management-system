"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_META, STATUSES } from "@/lib/admission/constants";
import type { Application } from "@/lib/admission/types";

const COLORS = { pending: "var(--chart-1)", under_review: "var(--chart-2)", approved: "var(--chart-3)", rejected: "var(--chart-4)" } as const;

export function StatusBreakdown({ apps, loading }: { apps: Application[]; loading?: boolean }) {
  const data = STATUSES.map((s) => ({ status: s, name: STATUS_META[s].label, value: apps.filter((a) => a.status === s).length }));
  const total = apps.length;
  const decided = data.find((d) => d.status === "approved")!.value + data.find((d) => d.status === "rejected")!.value;
  const approvalRate = decided ? Math.round((data.find((d) => d.status === "approved")!.value / decided) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Status breakdown</CardTitle>
        <CardDescription>Share of applications by decision stage</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {loading ? (
          <Skeleton className="mx-auto size-44 rounded-full" />
        ) : (
          <div className="relative mx-auto size-44">
            <PieChart width={176} height={176}>
                <Pie
                  isAnimationActive={false}
                  data={total ? data : [{ status: "pending", name: "None", value: 1 }]}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={total ? 3 : 0}
                  stroke="none"
                  cornerRadius={4}
                >
                  {(total ? data : [{ status: "pending" as const }]).map((d) => (
                    <Cell key={d.status} fill={total ? COLORS[d.status] : "var(--muted)"} />
                  ))}
                </Pie>
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold tabular-nums">{approvalRate}%</div>
              <div className="text-[11px] text-muted-foreground">approval rate</div>
            </div>
          </div>
        )}
        <ul className="space-y-2.5">
          {data.map((d) => (
            <li key={d.status} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-sm" style={{ background: COLORS[d.status] }} />
                {d.name}
              </span>
              <span className="font-medium tabular-nums">
                {loading ? "–" : d.value}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">{!loading && total ? `${Math.round((d.value / total) * 100)}%` : ""}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
