import { Badge } from "@/components/ui/badge";
import { STATUS_META, type AdmissionStatus } from "@/lib/admission/constants";

const BADGE_VARIANTS = {
  success: "default",
  warning: "secondary",
  info: "outline",
  destructive: "destructive",
} as const;

export function StatusBadge({ status }: { status: AdmissionStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={BADGE_VARIANTS[meta.variant]}>
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
}
