"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { AdmissionFormValues } from "@/lib/admission/schema";
import { TextField } from "../fields";

export function ParentStep() {
  const { getValues, setValue } = useFormContext<AdmissionFormValues>();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField name="fatherName" label="Father's name" placeholder="Father's full name" />
      <TextField name="motherName" label="Mother's name" placeholder="Mother's full name" />
      <div className="sm:col-span-2 -mb-1 flex items-center justify-between rounded-lg bg-muted/60 px-3.5 py-2.5 text-sm">
        <span className="text-muted-foreground">Guardian same as father?</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setValue("guardianName", getValues("fatherName"), { shouldValidate: true, shouldDirty: true })}
        >
          Copy father&apos;s name
        </Button>
      </div>
      <TextField name="guardianName" label="Guardian name" placeholder="Guardian's full name" />
      <TextField name="guardianMobile" label="Guardian mobile number" inputMode="numeric" maxLength={10} placeholder="10-digit number" />
      <TextField name="parentOccupation" label="Parent occupation" placeholder="e.g. Business owner" className="sm:col-span-2" />
    </div>
  );
}
