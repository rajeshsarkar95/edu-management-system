"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ACADEMIC_SESSIONS, ADMISSION_TYPES, DEPARTMENTS, coursesForDepartment, termsForCourse } from "@/lib/admission/constants";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { SelectField } from "../fields";

export function CourseStep() {
  const { control, setValue } = useFormContext<AdmissionFormValues>();
  const department = useWatch({ control, name: "department" });
  const course = useWatch({ control, name: "course" });
  const courseOptions = department ? coursesForDepartment(department).map((c) => c.name) : [];
  const termOptions = course ? termsForCourse(course) : [];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SelectField name="session" label="Academic session" options={ACADEMIC_SESSIONS} />
      <SelectField name="admissionType" label="Admission type" options={ADMISSION_TYPES} />
      <SelectField
        name="department"
        label="Department"
        options={DEPARTMENTS}
        onValueChange={() => {
          setValue("course", "", { shouldDirty: true });
          setValue("term", "", { shouldDirty: true });
        }}
      />
      <SelectField
        name="course"
        label="Course"
        options={courseOptions}
        disabled={!department}
        placeholder={department ? "Select course" : "Select a department first"}
        onValueChange={() => setValue("term", "", { shouldDirty: true })}
      />
      <SelectField
        name="term"
        label="Class / Semester"
        options={termOptions}
        disabled={!course}
        placeholder={course ? "Select class/semester" : "Select a course first"}
      />
    </div>
  );
}
