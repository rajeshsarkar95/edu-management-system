"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admission/confirm-dialog";
import { ApiError } from "@/lib/admission/api";
import { pendingFiles } from "@/lib/admission/pending-files";
import { DOCUMENT_KEYS } from "@/lib/admission/constants";
import { admissionFormSchema, emptyFormValues, FORM_STEPS, type AdmissionFormValues } from "@/lib/admission/schema";
import { useAdmissions } from "@/lib/admission/store";
import { AcademicStep } from "./steps/academic-step";
import { CourseStep } from "./steps/course-step";
import { DocumentsStep } from "./steps/documents-step";
import { ParentStep } from "./steps/parent-step";
import { PersonalStep } from "./steps/personal-step";
import { ReviewStep } from "./steps/review-step";
import { Stepper } from "./stepper";

const DRAFT_KEY = "ems.admission.draft.v1";
const LAST = FORM_STEPS.length - 1;

interface Draft {
  values: AdmissionFormValues;
  step: number;
  furthest: number;
}

export function AdmissionForm({ mode, applicationId, defaults }: { mode: "create" | "edit"; applicationId?: string; defaults?: AdmissionFormValues }) {
  const router = useRouter();
  const { create, update } = useAdmissions();

  const [step, setStep] = React.useState(0);
  const [furthest, setFurthest] = React.useState(0);
  const [returnToReview, setReturnToReview] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(mode === "edit");
  const stepRef = React.useRef(0);
  stepRef.current = step;


  const resolver = React.useCallback<Resolver<AdmissionFormValues>>(
    (values, ctx, opts) => {
      const schema = stepRef.current === LAST && mode === "create" ? admissionFormSchema : FORM_STEPS[stepRef.current].schema;
      return (zodResolver(schema as any) as Resolver<AdmissionFormValues>)(values, ctx, opts);
    },
    [mode],
  );

  const methods = useForm<AdmissionFormValues>({
    resolver,
    defaultValues: defaults ?? emptyFormValues,
    mode: "onTouched",
    shouldUnregister: false,
  });

  React.useEffect(() => {
    pendingFiles.clear(); 
    if (mode !== "create") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        const restored = { ...emptyFormValues, ...d.values, declaration: false };
        let lostFiles = false;
        for (const k of DOCUMENT_KEYS) if (restored[k]) { restored[k] = null; lostFiles = true; }
        if (restored.photo && !restored.photo.dataUrl) { restored.photo = null; lostFiles = true; }
        methods.reset(restored);
        if (lostFiles) toast.info("Please re-attach your documents", { description: "Uploaded files aren't kept in drafts." });
        setStep(Math.min(d.step ?? 0, LAST));
        setFurthest(Math.min(d.furthest ?? 0, LAST));
        toast.info("Draft restored", { description: "We found an unfinished application and restored it." });
      }
    } catch {
    }
    setHydrated(true);
  }, []);
  React.useEffect(() => {
    if (mode !== "create" || !hydrated) return;
    const sub = methods.watch((values) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: values as AdmissionFormValues, step: stepRef.current, furthest } satisfies Draft));
      } catch {
      }
    });
    return () => sub.unsubscribe();
  }, [methods, mode, hydrated, furthest]);

  React.useEffect(() => {
    if (mode !== "create" || !hydrated) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw){
        const d = JSON.parse(raw) as Draft;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d,step,furthest}));
      }
    } catch {
    }
  }, [step, furthest, mode, hydrated]);

  const topRef = React.useRef<HTMLDivElement>(null);

  const move = (to: number) => {
    stepRef.current = to;
    setStep(to);
    setFurthest((f) => Math.max(f, to));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function validateCurrent() {
    const ok = await methods.trigger(FORM_STEPS[step].fields as unknown as (keyof AdmissionFormValues)[]);
    if (!ok) {
      toast.error("Please fix the highlighted fields", { description: "Some required information is missing or invalid." });
      const first = Object.keys(methods.formState.errors)[0];
      if (first) requestAnimationFrame(() => document.getElementById(`f-${first}`)?.focus());
    }
    return ok;
  }

  async function next() {
    if (!(await validateCurrent())) return;
    if (returnToReview) {
      setReturnToReview(false);
      return move(LAST);
    }
    move(step + 1);
  }

  function back() {
    if (returnToReview) {
      setReturnToReview(false);
    }
    move(step - 1);
  }

  async function jumpTo(i: number) {
    if (i === step) return;
    if (i > step && !(await validateCurrent())) return;
    setReturnToReview(false);
    move(i);
  }

  function editSection(i: number) {
    setReturnToReview(true);
    move(i);
  }

  async function submit() {
    stepRef.current = LAST;
    const parsed = admissionFormSchema.safeParse(methods.getValues());
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = String(issue.path[0]);
      const idx = FORM_STEPS.findIndex((s) => (s.fields as readonly string[]).includes(field));
      if (field === "declaration") {
        await methods.trigger("declaration");
        toast.error("Please accept the declaration to submit");
        return;
      }
      toast.error("Some details need attention", { description: issue.message });
      if (idx >= 0 && idx < LAST) {
        stepRef.current = idx;
        setStep(idx);
        setTimeout(() => methods.trigger(FORM_STEPS[idx].fields as unknown as (keyof AdmissionFormValues)[]), 0);
      }
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = mode === "edit" && applicationId;
      const { application, failedUploads } = isEdit
        ? await update(applicationId, parsed.data as AdmissionFormValues)
        : await create(parsed.data as AdmissionFormValues);
      if (!isEdit) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
        }
      }
      toast.success(isEdit ? "Application updated" : "Application submitted", { description: `${application.fullName} · ${application.id}` });
      if (failedUploads.length) {
        toast.warning("Saved, but some files didn't upload", { description: `${failedUploads.join("; ")}. Open Edit to upload them again.`, duration: 10000 });
      }
      router.push(`/admission/${application.id}`);
    } catch (e) {
      setSubmitting(false);
      if (e instanceof ApiError && e.fieldErrors?.length){
        const field = e.fieldErrors[0].field.split(".")[0];
        const idx = FORM_STEPS.findIndex((s) => (s.fields as readonly string[]).includes(field));
        if (idx >= 0 && idx < LAST) {
          stepRef.current = idx;
          setStep(idx);
          setTimeout(() => methods.trigger(FORM_STEPS[idx].fields as unknown as (keyof AdmissionFormValues)[]), 0);
        }
      }
      toast.error("Submission failed", { description: e instanceof Error ? e.message : "Please try again." });
    }
  }

  function discardDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
    }
    methods.reset(emptyFormValues);
    pendingFiles.clear();
    setStep(0);
    setFurthest(0);
    setReturnToReview(false);
    toast.success("Draft cleared");
  }

  const current = FORM_STEPS[step];
  const body = [
    <PersonalStep key="p" />,
    <ParentStep key="pa" />,
    <AcademicStep key="a" />,
    <CourseStep key="c" />,
    <DocumentsStep key="d" />,
    <ReviewStep key="r" goTo={editSection} />,
  ][step];

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="scroll-mt-24" />
      <Card className="mb-6">
        <CardContent>
          <Stepper current={step} furthest={furthest} onSelect={jumpTo} />
        </CardContent>
      </Card>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === LAST) void submit();
          else void next();
        }}
      >
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-start justify-between gap-4 border-b py-5">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">
                {step + 1}. {step === LAST ? "Review & submit" : `${current.title} details`}
              </CardTitle>
              <CardDescription>
                {step === LAST
                  ? "Check everything below. Use Edit on any section to make changes."
                  : mode === "edit"
                    ? `Editing application ${applicationId}.`
                    : "Fields marked * are required."}
              </CardDescription>
            </div>
            {mode === "create" && (
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setDiscardOpen(true)}>
                <RotateCcw /> Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="py-6">{body}</CardContent>
          <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={() => (step === 0 ? router.back() : back())} disabled={submitting}>
              <ArrowLeft /> {step === 0 ? "Cancel" : "Previous"}
            </Button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {mode === "create" && <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex"><Save className="size-3.5" /> Draft saved automatically</span>}
              {returnToReview && step !== LAST && (
                <Button type="submit" variant="secondary">
                  Save & back to review
                </Button>
              )}
              {step === LAST ? (
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                  {submitting ? "Submitting…" : mode === "edit" ? "Save changes" : "Submit application"}
                </Button>
              ) : (
                !returnToReview && (
                  <Button type="submit">
                    Next <ArrowRight />
                  </Button>
                )
              )}
            </div>
          </div>
        </Card>
      </form>

      <ConfirmDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        destructive
        title="Clear this form?"
        description="All the information you've entered so far will be removed. This can't be undone."
        confirmLabel="Clear form"
        onConfirm={discardDraft}
      />
    </FormProvider>
  );
}