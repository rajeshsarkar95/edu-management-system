import type { Metadata } from "next";
import { PageHeader } from "@/components/admission/page-header";
import { AdmissionForm } from "@/components/admission/form/admission-form";

export const metadata: Metadata = { title: "New Admission" };

export default function NewAdmissionPage() {
  return (
    <>
      <PageHeader title="New Admission" description="Complete the six steps to register a new student application." />
      <AdmissionForm mode="create" />
    </>
  );
}
