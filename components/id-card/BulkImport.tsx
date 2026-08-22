"use client";

import { useRef, useState } from "react";
import { parseStudentsCsv, downloadCsvTemplate } from "@/lib/csv";
import { Student } from "@/lib/types";

interface Props {
  onImport: (students: Student[]) => void;
}

export function BulkImport({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const { students, skippedRows, unrecognizedColumns } = parseStudentsCsv(text);

    if (students.length === 0) {
      setStatus("No valid rows found — check that a 'name' column is present.");
      return;
    }

    onImport(students);

    const notes = [`Imported ${students.length} student${students.length === 1 ? "" : "s"}.`];
    if (skippedRows > 0) notes.push(`${skippedRows} row(s) skipped (missing name).`);
    if (unrecognizedColumns.length > 0)
      notes.push(`Ignored unrecognized column(s): ${unrecognizedColumns.join(", ")}.`);
    setStatus(notes.join(" "));
  };

  return (
    <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-800">Bulk import from CSV</p>
          <p className="text-xs text-ink-400">
            Columns: name, student id, roll number, class, section, admission number, dob, blood group, guardian name, guardian phone, address, valid through.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            Download template
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Upload CSV
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {status && <p className="mt-2 text-xs text-ink-500">{status}</p>}
    </div>
  );
}
