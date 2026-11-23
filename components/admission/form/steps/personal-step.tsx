"use client";

import { Controller, useFormContext } from "react-hook-form";
import { GENDERS } from "@/lib/admission/constants";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { cn } from "@/lib/utils";
import { FileUpload } from "../file-upload";
import { Field, SelectField, TextField } from "../fields";

export function PersonalStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField name="fullName" label="Student full name" placeholder="e.g. Aarav Sharma" className="sm:col-span-2" />
      <TextField name="dob" label="Date of birth" type="date" max={today} />
      <SelectField name="gender" label="Gender" options={GENDERS} />
      <TextField name="email" label="Email address" type="email" placeholder="student@example.com" />
      <TextField name="mobile" label="Mobile number" inputMode="numeric" maxLength={10} placeholder="10-digit number" hint="Indian mobile number starting with 6–9" />
      <div className="sm:col-span-2">
        <Controller
          control={control}
          name="photo"
          render={({ field }) => (
            <FileUpload
              id="photo-personal"
              variant="photo"
              label="Student photograph"
              required
              hint="Passport-size photo"
              value={field.value}
              onChange={field.onChange}
              error={(errors.photo as { message?: string; } | undefined)?.message} fieldKey={""}/>
          )}
        />
      </div>
    </div>
  );
}
export { Field, cn };
