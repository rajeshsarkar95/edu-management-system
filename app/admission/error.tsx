"use client";

import { ErrorState } from "@/components/admission/states";

export default function AdmissionError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="This page hit an error" message={error.message} onRetry={reset} />;
}
