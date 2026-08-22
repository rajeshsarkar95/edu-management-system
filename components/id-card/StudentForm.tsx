"use client";

import { Student } from "@/lib/types";
import { PhotoUpload } from "./PhotoUpload";

interface Props {
  student: Student;
  onChange: (next: Student) => void;
}

const FIELDS: { key: keyof Student; label: string; placeholder: string }[] = [
  { key: "name", label: "Student name", placeholder: "Ananya Sharma" },
  { key: "studentId", label: "Student ID", placeholder: "GA-2026-0142" },
  { key: "rollNumber", label: "Roll number", placeholder: "14" },
  { key: "className", label: "Class", placeholder: "Grade 9" },
  { key: "section", label: "Section", placeholder: "B" },
  { key: "admissionNumber", label: "Admission number", placeholder: "ADM-3391" },
  { key: "dob", label: "Date of birth", placeholder: "DD/MM/YYYY" },
  { key: "bloodGroup", label: "Blood group", placeholder: "B+" },
  { key: "guardianName", label: "Guardian name", placeholder: "Rajesh Sharma" },
  { key: "guardianPhone", label: "Guardian phone", placeholder: "+91 98110 22334" },
  { key: "validThrough", label: "Valid through", placeholder: "06/2027" },
];

export function StudentForm({ student, onChange }: Props) {
  const set = (key: keyof Student, value: string) =>
    onChange({ ...student, [key]: value });

  return (
    <div className="space-y-4">
      <PhotoUpload
        value={student.photoDataUrl}
        onChange={(dataUrl) => onChange({ ...student, photoDataUrl: dataUrl })}
      />

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "name" ? "col-span-2" : ""}>
            <label className="mb-1 block text-xs font-medium text-ink-600">
              {f.label}
            </label>
            <input
              value={student[f.key] as string}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-md border border-ink-200 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-600">Address</label>
        <textarea
          value={student.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="22 Lake View Colony, Meerut"
          rows={2}
          className="w-full resize-none rounded-md border border-ink-200 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
      </div>
    </div>
  );
}
