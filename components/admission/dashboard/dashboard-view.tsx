"use client";
import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ErrorState } from "@/components/admission/states";
import { PageHeader } from "@/components/admission/page-header";
import { ACADEMIC_SESSIONS } from "@/lib/admission/constants";
import { useAdmissions } from "@/lib/admission/store";
import { AdmissionChart } from "./admission-chart";
import { RecentApplications } from "./recent-applications";
import { StatCards } from "./stat-cards";
import { StatusBreakdown } from "./status-breakdown";

export function DashboardView() {
  const { applications, state, error, retry } = useAdmissions();
  const [session, setSession] = React.useState("all");
  const loading = state === "loading";

  const scoped = React.useMemo(
    () => (session === "all" ? applications : applications.filter((a) => a.session === session)),
    [applications, session],
  );

  if (state === "error") {
    return (
      <>
        <PageHeader title="Admission Dashboard" />
        <ErrorState title="Couldn't load admissions" message={error} onRetry={retry} />
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Admission Dashboard"
        description="Track applications from submission to final decision."
        actions={
          <>
            <select
              value={session}
              onChange={(event) => setSession(event.target.value)}
              aria-label="Academic session"
              className="h-10 w-[170px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All sessions</option>
              {ACADEMIC_SESSIONS.map((s) => (
                <option key={s} value={s}>
                  Session {s}
                </option>
              ))}
            </select>
            <Link
              href="/admission/new"
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <Plus /> New Admission
            </Link>
          </>
        }
      />
      <div className="space-y-6">
        <StatCards apps={scoped} loading={loading} />
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <AdmissionChart apps={scoped} loading={loading} />
          </div>
          <StatusBreakdown apps={scoped} loading={loading} />
        </div>
        <RecentApplications apps={scoped} loading={loading} />
      </div>
    </>
  );
}
