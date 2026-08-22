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

export const ClassicTemplate = forwardRef<HTMLDivElement, Props>(function ClassicTemplate(
  { student, school, side, codeType },
  ref
) {
  if (side === "back") {
    return (
      <CardShell forwardedRef={ref} className="bg-classic-cream">
        <div className="m-1 flex h-[calc(100%-8px)] flex-col justify-between border border-classic-line/50 p-2.5">
          <div>
            <p className="text-center font-display text-[9.5px] font-semibold uppercase tracking-wide text-classic-base">
              Terms of Use
            </p>
            <p className="mt-1 text-[6.8px] leading-snug text-ink-600">
              This card certifies bearer as a bona fide student of {school.name} for
              session {school.sessionLabel}. Non-transferable. Report loss to the
              administration office immediately.
            </p>
            <div className="mt-1.5 space-y-0.5 text-[7px] leading-tight text-ink-600">
              <p>
                <span className="font-semibold text-ink-800">Guardian:</span>{" "}
                {student.guardianName || "—"} ({student.guardianPhone || "—"})
              </p>
              <p>
                <span className="font-semibold text-ink-800">Address:</span>{" "}
                {student.address || school.address}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-center text-[7px] text-ink-500">
              <div className="mb-1 h-px w-16 bg-classic-base/40" />
              {school.signatureLabel}
            </div>
            <CodeBlock type={codeType} value={student.studentId || student.id} size={44} fg="#6B1E2A" bg="#F4EDE1" />
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell forwardedRef={ref} className="bg-classic-cream">
      <div className="absolute inset-1 border border-classic-line/60" />
      <div className="relative flex h-full flex-col items-center px-3 pt-2 text-center">
        <div className="flex items-center gap-1.5">
          {school.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logoDataUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-classic-base text-[9px] font-bold text-classic-cream">
              {school.name.charAt(0)}
            </div>
          )}
          <div className="text-left leading-tight">
            <p className="font-display text-[11px] font-semibold text-classic-base">
              {school.name}
            </p>
            <p className="text-[6.5px] uppercase tracking-widest text-classic-base/70">
              {school.tagline}
            </p>
          </div>
        </div>

        <div className="my-1.5 h-[1px] w-3/4 bg-classic-line" />

        <div className="h-[52px] w-[46px] overflow-hidden rounded-full border-2 border-classic-base bg-white">
          {student.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.photoDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[6px] text-ink-400">
              Photo
            </div>
          )}
        </div>

        <p className="mt-1 font-display text-[12px] font-semibold text-classic-base">
          {student.name || "Student Name"}
        </p>
        <p className="text-[7px] uppercase tracking-wide text-ink-500">
          {student.className ? `${student.className}${student.section ? " · Sec " + student.section : ""}` : "Class · Section"}
        </p>

        <div className="mt-1.5 grid w-full grid-cols-2 gap-x-2 gap-y-0.5 border-t border-classic-line/40 pt-1 text-[6.8px] text-ink-600">
          <p><span className="text-ink-400">ID </span><span className="font-semibold">{student.studentId || "—"}</span></p>
          <p><span className="text-ink-400">Roll </span><span className="font-semibold">{student.rollNumber || "—"}</span></p>
        </div>
      </div>
    </CardShell>
  );
});
