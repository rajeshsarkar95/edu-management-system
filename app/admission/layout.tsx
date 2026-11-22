import { AdmissionProvider } from "@/lib/admission/store";
import AppShell from "@/components/layout/AppLayout";

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdmissionProvider>
      <AppShell title="">
        {children}
      </AppShell>
    </AdmissionProvider>
  );
}