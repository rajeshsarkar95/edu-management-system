import type { Metadata } from "next";
import { ApplicationDetails } from "@/components/admission/details/application-details";

export const metadata: Metadata = { title: "Application Details" };

export default function ApplicationDetailsPage() {
  return <ApplicationDetails />;
}
