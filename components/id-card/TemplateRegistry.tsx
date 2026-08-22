import { forwardRef } from "react";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { CompactTemplate } from "./templates/CompactTemplate";
import { SchoolInfo, Student, TemplateId, CodeType } from "@/lib/types";

export const TEMPLATES: { id: TemplateId; label: string; blurb: string }[] = [
  { id: "modern", label: "Modern", blurb: "Navy & gold, institutional" },
  { id: "classic", label: "Classic", blurb: "Maroon crest, traditional" },
  { id: "compact", label: "Compact", blurb: "Dense layout, bulk-friendly" },
];

interface Props {
  templateId: TemplateId;
  student: Student;
  school: SchoolInfo;
  side: "front" | "back";
  codeType: CodeType;
}

export const IDCardRenderer = forwardRef<HTMLDivElement, Props>(function IDCardRenderer(
  { templateId, ...rest },
  ref
) {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate ref={ref} {...rest} />;
    case "compact":
      return <CompactTemplate ref={ref} {...rest} />;
    case "modern":
    default:
      return <ModernTemplate ref={ref} {...rest} />;
  }
});
