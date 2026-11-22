"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { GRADE_TYPES, QUALIFICATIONS } from "@/lib/admission/constants";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { SelectField, TextField } from "../fields";

export function AcademicStep() {
  const { control } = useFormContext<AdmissionFormValues>();
  const gradeType = useWatch({ control, name: "gradeType" });
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField name="previousSchool" label="Previous school / college" placeholder="Name of institution" className="sm:col-span-2" />
      <SelectField name="qualification" label="Previous qualification" options={QUALIFICATIONS} />
      <TextField name="board" label="Board / University" placeholder="e.g. CBSE" />
      <TextField name="passingYear" label="Passing year" inputMode="numeric" maxLength={4} placeholder="e.g. 2025" />
      <div className="grid grid-cols-[130px_1fr] gap-3">
        <SelectField name="gradeType" label="Grade type" options={GRADE_TYPES} required={false} placeholder="Type" />
        <TextField
          name="score"
          label={gradeType === "CGPA" ? "CGPA" : "Percentage"}
          inputMode="decimal"
          placeholder={gradeType === "CGPA" ? "e.g. 8.4" : "e.g. 82.5"}
          hint={gradeType === "CGPA" ? "Between 3 and 10" : "Between 33 and 100"}
        />
      </div>
    </div>
  );
}
