import { forwardRef } from "react";
import { IDCardRenderer } from "./TemplateRegistry";
import { SchoolInfo, Student, TemplateId, CodeType } from "@/lib/types";

const CARDS_PER_PAGE = 8; // 2 columns x 4 rows, fits A4 with margins

interface Props {
  students: Student[];
  school: SchoolInfo;
  templateId: TemplateId;
  codeType: CodeType;
  side: "front" | "back";
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const CardGrid = forwardRef<HTMLDivElement, Props>(function CardGrid(
  { students, school, templateId, codeType, side },
  ref
) {
  const pages = chunk(students, CARDS_PER_PAGE);

  return (
    <div ref={ref} id="print-root">
      {pages.map((pageStudents, pageIdx) => (
        <div
          key={pageIdx}
          className="pdf-page card-sheet mx-auto mb-6 grid grid-cols-2 justify-items-center gap-4 rounded-lg bg-white p-6 shadow-card print:mb-0 print:shadow-none"
        >
          {pageStudents.map((student) => (
            <IDCardRenderer
              key={student.id}
              templateId={templateId}
              student={student}
              school={school}
              side={side}
              codeType={codeType}
            />
          ))}
        </div>
      ))}
    </div>
  );
});
