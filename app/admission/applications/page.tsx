import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplicationsView } from "@/components/admission/listing/applications-view";
import { TableSkeleton } from "@/components/admission/states";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <ApplicationsView />
    </Suspense>
  );
}
