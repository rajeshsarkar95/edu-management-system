"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/admission/states";
import { PageHeader } from "@/components/admission/page-header";
import { useAdmissions } from "@/lib/admission/store";
import { AdmissionForm } from "./admission-form";
import type { AdmissionFormValues } from "@/lib/admission/schema";

export function EditAdmission() {
  const { id } = useParams<{ id: string }>();
  const { getById, state, error, retry } = useAdmissions();

  if (state === "loading") return <><PageHeader title="Edit Application" /><Skeleton className="h-[480px] w-full rounded-xl" /></>;
  if (state === "error") return <ErrorState message={error} onRetry={retry} />;

  const app = getById(id);
  if (!app)
    return (
      <Card>
        <EmptyState
          title="Application not found"
          description={`There is no application with ID ${id}.`}
          action={<Button asChild><Link href="/admission/applications">Go to applications</Link></Button>}
        />
      </Card>
    );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, applicationDate: _a, status: _s, remarks: _r, decidedAt: _d, timeline: _t, ...values } = app;
  return (
    <>
      <PageHeader title={`Edit ${app.fullName}`} description={`Application ${app.id}`} />
      <AdmissionForm mode="edit" applicationId={app.id} defaults={{ ...(values as AdmissionFormValues), declaration: false }} />
    </>
  );
}
