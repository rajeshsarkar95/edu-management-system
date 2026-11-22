"use client";

import * as React from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdmissionFormValues } from "@/lib/admission/schema";

type Name = FieldPath<AdmissionFormValues>;

export function Field({
  label,
  name,
  required = true,
  hint,
  children,
  className,
}: {
  label: string;
  name: Name;
  required?: boolean;
  hint?: string;
  children: (p: { id: string; invalid: boolean; describedBy?: string }) => React.ReactNode;
  className?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext<AdmissionFormValues>();
  const err = errors[name as keyof AdmissionFormValues] as { message?: string } | undefined;
  const id = `f-${name}`;
  const msgId = `${id}-msg`;
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children({ id, invalid: !!err, describedBy: err ? msgId : undefined })}
      {err?.message ? (
        <p id={msgId} role="alert" className="mt-1.5 text-xs text-destructive">
          {err.message}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  required,
  hint,
  inputMode,
  maxLength,
  className,
  max,
}: {
  name: Name;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  className?: string;
  max?: string;
}) {
  const { register } = useFormContext<AdmissionFormValues>();
  return (
    <Field name={name} label={label} required={required} hint={hint} className={className}>
      {({ id, invalid, describedBy }) => (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          max={max}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          {...register(name as Exclude<Name, "photo">)}
        />
      )}
    </Field>
  );
}

export function SelectField({
  name,
  label,
  options,
  placeholder = "Select…",
  required,
  disabled,
  hint,
  onValueChange,
  className,
}: {
  name: Name;
  label: string;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  onValueChange?: (v: string) => void;
  className?: string;
}) {
  const { control } = useFormContext<AdmissionFormValues>();
  return (
    <Field name={name} label={label} required={required} hint={hint} className={className}>
      {({ id, invalid, describedBy }) => (
        <Controller
          control={control}
          name={name as Exclude<Name, "photo">}
          render={({ field }) => (
            <Select
              value={(field.value as string) || undefined}
              onValueChange={(v) => {
                field.onChange(v);
                onValueChange?.(v);
              }}
              disabled={disabled}
            >
              <SelectTrigger id={id} aria-invalid={invalid} aria-describedby={describedBy} onBlur={field.onBlur}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}
    </Field>
  );
}
