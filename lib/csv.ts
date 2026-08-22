import Papa from "papaparse";
import { CSV_FIELD_MAP, Student, emptyStudent } from "./types";

export interface CsvParseResult {
  students: Student[];
  skippedRows: number;
  unrecognizedColumns: string[];
}

export function parseStudentsCsv(fileText: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim().toLowerCase(),
  });

  const unrecognizedColumns = (parsed.meta.fields ?? []).filter(
    (f: string | number) => !CSV_FIELD_MAP[f]
  );

  let skippedRows = 0;
  const students: Student[] = [];

  for (const row of parsed.data) {
    const student = emptyStudent();
    let hasName = false;

    for (const [rawHeader, value] of Object.entries(row)) {
      const key = CSV_FIELD_MAP[rawHeader];
      if (!key || value == null) continue;
      (student[key] as string) = String(value).trim();
      if (key === "name" && student.name) hasName = true;
    }

    if (!hasName) {
      skippedRows++;
      continue;
    }
    students.push(student);
  }

  return { students, skippedRows, unrecognizedColumns };
}

export function downloadCsvTemplate() {
  const headers = [
    "name",
    "student id",
    "roll number",
    "class",
    "section",
    "admission number",
    "dob",
    "blood group",
    "guardian name",
    "guardian phone",
    "address",
    "valid through",
  ];
  const example = [
    "Ananya Sharma",
    "GA-2026-0142",
    "14",
    "Grade 9",
    "B",
    "ADM-3391",
    "12/04/2011",
    "B+",
    "Rajesh Sharma",
    "+91 98110 22334",
    "22 Lake View Colony, Meerut",
    "06/2027",
  ];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-id-bulk-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
