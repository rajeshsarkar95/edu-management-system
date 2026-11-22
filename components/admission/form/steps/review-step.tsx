"use client";

import { Controller, useFormContext } from "react-hook-form";
import { BookOpen, FileCheck2, FileX2, GraduationCap, Pencil, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DOCUMENT_KEYS, DOCUMENT_META } from "@/lib/admission/constants";
import { formatDate, formatFileSize, formatScore } from "@/lib/admission/format";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { StudentAvatar } from "@/components/admission/student-avatar";
import { cn } from "@/lib/utils";

function Section({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border">
      <header className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-primary" /> {title}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${title}`}>
          <Pencil /> Edit
        </Button>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd className="text-sm font-medium break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ReviewStep({ goTo }: { goTo: (step: number) => void }) {
  const {
    watch,
    control,
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();
  const v = watch();
  const declErr = (errors.declaration as { message?: string } | undefined)?.message;

  return (
    <div className="space-y-4">
      <Section title="Personal details" icon={User} onEdit={() => goTo(0)}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <StudentAvatar name={v.fullName || "Student"} src={v.photo?.dataUrl} className="size-20 rounded-xl text-xl [&>*]:rounded-xl" />
          <div className="flex-1">
            <Rows
              rows={[
                ["Full name", v.fullName],
                ["Date of birth", formatDate(v.dob)],
                ["Gender", v.gender],
                ["Email", v.email],
                ["Mobile", v.mobile],
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Parent details" icon={Users} onEdit={() => goTo(1)}>
        <Rows
          rows={[
            ["Father's name", v.fatherName],
            ["Mother's name", v.motherName],
            ["Guardian name", v.guardianName],
            ["Guardian mobile", v.guardianMobile],
            ["Parent occupation", v.parentOccupation],
          ]}
        />
      </Section>

      <Section title="Academic details" icon={GraduationCap} onEdit={() => goTo(2)}>
        <Rows
          rows={[
            ["Previous school/college", v.previousSchool],
            ["Qualification", v.qualification],
            ["Board/University", v.board],
            ["Passing year", v.passingYear],
            [v.gradeType === "CGPA" ? "CGPA" : "Percentage", v.score ? formatScore(v.gradeType, v.score) : ""],
          ]}
        />
      </Section>

      <Section title="Course details" icon={BookOpen} onEdit={() => goTo(3)}>
        <Rows
          rows={[
            ["Academic session", v.session],
            ["Department", v.department],
            ["Course", v.course],
            ["Class/Semester", v.term],
            ["Admission type", v.admissionType],
          ]}
        />
      </Section>

      <Section title="Documents" icon={FileCheck2} onEdit={() => goTo(4)}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[{ k: "photo", label: "Student Photograph", file: v.photo }, ...DOCUMENT_KEYS.map((k) => ({ k, label: DOCUMENT_META[k].label, file: v[k] }))].map(({ k, label, file }) => (
            <li key={k} className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              {file ? <FileCheck2 className="size-4 shrink-0 text-success" /> : <FileX2 className="size-4 shrink-0 text-muted-foreground" />}
              <div className="min-w-0">
                <div className="font-medium">{label}</div>
                <div className={cn("truncate text-xs", file ? "text-muted-foreground" : "text-muted-foreground/70")}>
                  {file ? `${file.name} · ${formatFileSize(file.size)}` : "Not provided"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className={cn("rounded-xl border p-4", declErr && "border-destructive/60 bg-destructive/5")}>
        <Controller
          control={control}
          name="declaration"
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                id="declaration"
                checked={field.value}
                onCheckedChange={(c) => field.onChange(c === true)}
                aria-invalid={!!declErr}
                className="mt-0.5"
              />
              <span className="text-sm leading-relaxed">
                I hereby declare that the information and documents provided in this application are true and complete to the best of my knowledge. I understand that any false
                information may lead to cancellation of admission.
              </span>
            </label>
          )}
        />
        {declErr && (
          <p role="alert" className="mt-2 pl-7 text-xs text-destructive">
            {declErr}
          </p>
        )}
      </div>
    </div>
  );
}
