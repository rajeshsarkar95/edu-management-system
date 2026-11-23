"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, FileSearch, GraduationCap, Pencil, Printer, Trash2, User, Users, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplicationActions } from "@/components/admission/application-actions";
import { EmptyState, ErrorState } from "@/components/admission/states";
import { StatusBadge } from "@/components/admission/status-badge";
import { StudentAvatar } from "@/components/admission/student-avatar";
import { formatDate, formatScore } from "@/lib/admission/format";
import { useAdmissions } from "@/lib/admission/store";
import { DocumentsCard } from "./documents-card";
import { InfoCard, InfoGrid } from "./info-grid";
import { StatusCard } from "./status-card";
import { TimelineCard } from "./timeline-card";

function DetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, state, error, retry } = useAdmissions();
  const actions = useApplicationActions({ onDeleted: () => router.push("/admission/applications") });

  const back = (
    <Link href="/admission/applications">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <ArrowLeft /> Back to applications
      </Button>
    </Link>
  );

  if (state === "loading") return <>{back}<DetailsSkeleton /></>;
  if (state === "error") return <>{back}<ErrorState title="Couldn't load this application" message={error} onRetry={retry} /></>;

  const app = getById(id);
  if (!app) {
    return (
      <>
        {back}
        <Card>
          <EmptyState
            title="Application not found"
            description={`There is no application with ID ${id}. It may have been deleted.`}
            action={
              <Link href="/admission/applications">
                <Button>Go to applications</Button>
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="no-print">{back}</div>
      <Card className="mb-6 gap-0 py-0">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <StudentAvatar name={app.fullName} src={app.photo?.dataUrl} className="size-16 text-lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight">{app.fullName}</h1>
                <StatusBadge status={app.status} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono">{app.id}</span>
                <span>·</span>
                <span>{app.course}</span>
                <span>·</span>
                <span>Session {app.session}</span>
              </div>
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            <Link href={`/admission/${app.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil /> Edit
              </Button>
            </Link>
            {app.status === "pending" && (
              <Button variant="outline" size="sm" onClick={() => actions.markUnderReview(app)}>
                <FileSearch /> Mark under review
              </Button>
            )}
            <Button variant="default" size="sm" disabled={app.status === "approved"} onClick={() => actions.approve(app)}>
              <CheckCircle2 /> Approve
            </Button>
            <Button variant="destructive" size="sm" disabled={app.status === "rejected"} onClick={() => actions.reject(app)}>
              <XCircle /> Reject
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label="Delete application" title="Delete" onClick={() => actions.remove(app)}>
              <Trash2 />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <InfoCard title="Personal Information" icon={User}>
            <InfoGrid
              items={[
                { label: "Full name", value: app.fullName },
                { label: "Date of birth", value: formatDate(app.dob) },
                { label: "Gender", value: app.gender },
                { label: "Email", value: app.email },
                { label: "Mobile number", value: app.mobile },
              ]}
            />
          </InfoCard>

          <InfoCard title="Parent Information" icon={Users}>
            <InfoGrid
              items={[
                { label: "Father's name", value: app.fatherName },
                { label: "Mother's name", value: app.motherName },
                { label: "Guardian name", value: app.guardianName },
                { label: "Guardian mobile", value: app.guardianMobile },
                { label: "Parent occupation", value: app.parentOccupation },
              ]}
            />
          </InfoCard>

          <InfoCard title="Academic Information" icon={GraduationCap}>
            <InfoGrid
              items={[
                { label: "Previous school / college", value: app.previousSchool },
                { label: "Previous qualification", value: app.qualification },
                { label: "Board / University", value: app.board },
                { label: "Passing year", value: app.passingYear },
                { label: app.gradeType === "CGPA" ? "CGPA" : "Percentage", value: formatScore(app.gradeType, app.score) },
              ]}
            />
          </InfoCard>

          <InfoCard title="Course Information" icon={BookOpen}>
            <InfoGrid
              items={[
                { label: "Academic session", value: app.session },
                { label: "Department", value: app.department },
                { label: "Course", value: app.course },
                { label: "Class / Semester", value: app.term },
                { label: "Admission type", value: <Badge variant="secondary">{app.admissionType}</Badge> },
              ]}
            />
          </InfoCard>

          <DocumentsCard app={app} />
        </div>

        <div className="space-y-6">
          <StatusCard app={app} />
          <TimelineCard app={app} />
        </div>
      </div>
      {actions.dialogs}
    </>
  );
}
