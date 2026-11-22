import type { Metadata } from "next";
import { DashboardView } from "@/components/admission/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Admission Dashboard" };

export default function AdmissionDashboardPage() {
  return <DashboardView />;
}
