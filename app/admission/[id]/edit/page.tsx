import type { Metadata } from "next";
import { EditAdmission } from "@/components/admission/form/edit-admission";

export const metadata: Metadata = { title: "Edit Application" };

export default function EditAdmissionPage() {
  return <EditAdmission />;
}
