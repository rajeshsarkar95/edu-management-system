import { forwardRef } from "react";
import { CardShell } from "../CardShell";
import { CodeBlock } from "../CodeBlock";
import { SchoolInfo, Student, CodeType } from "@/lib/types";

interface Props {
  student: Student;
  school: SchoolInfo;
  side: "front" | "back";
  codeType: CodeType;
}

export const ModernTemplate = forwardRef<HTMLDivElement, Props>(function ModernTemplate(
  { student, school, side, codeType },
  ref
) {
  if (side === "back") {
    return (
      <CardShell forwardedRef={ref} className="bg-modern-paper">
        <div className="flex h-full flex-col justify-between p-3.5">
          <div>
            <p className="font-display text-[11px] font-semibold text-modern-base">
              {school.name}
            </p>
            <div className="mt-1.5 space-y-0.5 text-[7.5px] leading-tight text-ink-600">
              <p>
                <span className="font-semibold text-ink-800">Guardian: </span>
                {student.guardianName || "—"} · {student.guardianPhone || "—"}
              </p>
              <p>
                <span className="font-semibold text-ink-800">Address: </span>
                {student.address || school.address}
              </p>
              <p>
                <span className="font-semibold text-ink-800">Blood group: </span>
                {student.bloodGroup || "—"}
              </p>
            </div>
            <p className="mt-2 text-[7px] leading-snug text-ink-400">
              This card is the property of {school.name}. If found, please return
              to the school office at {school.address}.
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-[7px] text-ink-400">
              <div className="mb-1 h-px w-16 bg-ink-200" />
              {school.signatureLabel}
            </div>
            <CodeBlock type={codeType} value={student.studentId || student.id} size={46} fg="#12213E" />
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell forwardedRef={ref} className="bg-white">
      <div className="flex h-[52px] items-center justify-between bg-modern-base px-3.5">
        <div className="flex items-center gap-1.5">
          {school.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logoDataUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-modern-gold text-[9px] font-bold text-modern-gold">
              {school.name.charAt(0)}
            </div>
          )}
          <div className="leading-tight">
            <p className="font-display text-[11.5px] font-semibold text-white">
              {school.name}
            </p>
            <p className="text-[6.5px] uppercase tracking-wide text-modern-gold">
              {school.tagline}
            </p>
          </div>
        </div>
        <span className="rounded-sm border border-modern-gold/60 px-1.5 py-0.5 text-[6.5px] font-medium text-modern-gold">
          {school.sessionLabel}
        </span>
      </div>

      <div className="flex gap-2.5 px-3.5 pt-2.5">
        <div className="h-[62px] w-[52px] shrink-0 overflow-hidden rounded-md border border-ink-200 bg-ink-100">
          {student.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photoDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[6.5px] text-ink-400">
              Photo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[13px] font-semibold text-modern-base">
            {student.name || "Student Name"}
          </p>
          <p className="text-[7px] font-medium uppercase tracking-wide text-modern-gold">
            {student.className ? `${student.className}${student.section ? " · " + student.section : ""}` : "Class · Section"}
          </p>
          <dl className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px] text-ink-600">
            <div>
              <dt className="text-ink-400">Student ID</dt>
              <dd className="font-semibold text-ink-800">{student.studentId || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Roll No.</dt>
              <dd className="font-semibold text-ink-800">{student.rollNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Admission No.</dt>
              <dd className="font-semibold text-ink-800">{student.admissionNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-400">Valid Through</dt>
              <dd className="font-semibold text-ink-800">{student.validThrough || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-modern-gold" />
    </CardShell>
  );
});
