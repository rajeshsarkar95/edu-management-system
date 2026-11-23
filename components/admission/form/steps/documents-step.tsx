"use client";

import { Controller, useFormContext } from "react-hook-form";
import { DOCUMENT_KEYS, DOCUMENT_META } from "@/lib/admission/constants";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { FileUpload } from "../file-upload";

export function DocumentsStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();
  const err = (k: keyof AdmissionFormValues) => (errors[k] as { message?: string } | undefined)?.message;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Controller
        control={control}
        name="photo"
        render={({ field }) => (
          <FileUpload id="photo-docs" variant="photo" label="Student photograph" required hint="Passport-size" value={field.value} onChange={field.onChange} error={err("photo")} fieldKey={""} />
        )}
      />
      {DOCUMENT_KEYS.map((k) => (
        <Controller
          key={k}
          control={control}
          name={k}
          render={({ field }) => (
            <FileUpload
              id={`doc-${k}`}
              label={DOCUMENT_META[k].label}
              required={DOCUMENT_META[k].required}
              hint={DOCUMENT_META[k].hint}
              value={field.value}
              onChange={field.onChange}
              error={err(k)} fieldKey={""}/>
          )}
        />
      ))}
    </div>
  );
}
