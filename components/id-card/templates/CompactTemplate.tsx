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

export const CompactTemplate = forwardRef<HTMLDivElement, Props>(function CompactTemplate(
  { student, school, side, codeType },
  ref
) {
  if (side === "back") {
    return (
      <CardShell forwardedRef={ref} className="bg-compact-paper font-mono">
        <div className="flex h-full flex-col justify-between p-2.5">
          <div className="space-y-1 text-[6.8px] leading-tight text-compact-slate">
            <p><span className="text-ink-400">GUARDIAN </span>{student.guardianName || "—"}</p>
            <p><span className="text-ink-400">PHONE&nbsp;&nbsp;&nbsp; </span>{student.guardianPhone || "—"}</p>
            <p><span className="text-ink-400">ADDRESS </span>{student.address || school.address}</p>
            <p><span className="text-ink-400">BLOOD&nbsp;&nbsp;&nbsp; </span>{student.bloodGroup || "—"}</p>
          </div>
          <div className="flex items-end justify-between">
            <p className="max-w-[150px] text-[6px] leading-snug text-ink-400">
              Property of {school.name}. {school.phone}
            </p>
            <CodeBlock type={codeType} value={student.studentId || student.id} size={42} fg="#0F5257" bg="#F2F7F6" />
          </div>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell forwardedRef={ref} className="bg-white">
      <div className="flex h-full">
        <div className="flex w-[92px] shrink-0 flex-col items-center justify-start gap-1.5 bg-compact-base p-2 pt-3">
          <div className="h-[58px] w-[52px] overflow-hidden rounded-sm border border-white/30 bg-white/10">
            {student.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.photoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[6px] text-white/60">
                Photo
              </div>
            )}
          </div>
          <div className="rounded bg-white p-1">
            <CodeBlock type={codeType} value={student.studentId || student.id} size={36} fg="#0F5257" bg="#ffffff" />
          </div>
        </div>

        <div className="flex-1 p-2.5 font-mono">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-compact-base">
            {school.name}
          </p>
          <p className="mt-0.5 truncate text-[12px] font-bold leading-tight text-ink-900">
            {student.name || "Student Name"}
          </p>
          <div className="mt-1.5 h-px w-full bg-ink-100" />
          <dl className="mt-1.5 space-y-0.5 text-[7px] text-ink-600">
            <div className="flex justify-between">
              <dt className="text-ink-400">CLASS/SEC</dt>
              <dd className="font-semibold text-ink-800">
                {student.className || "—"}{student.section ? `/${student.section}` : ""}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">ROLL NO</dt>
              <dd className="font-semibold text-ink-800">{student.rollNumber || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">STUDENT ID</dt>
              <dd className="font-semibold text-ink-800">{student.studentId || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">ADM NO</dt>
              <dd className="font-semibold text-ink-800">{student.admissionNumber || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-400">VALID</dt>
              <dd className="font-semibold text-ink-800">{student.validThrough || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </CardShell>
  );
});
