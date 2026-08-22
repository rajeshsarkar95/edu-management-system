"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import AppLayout from "@/components/layout/AppLayout";
import { RosterList } from "@/components/id-card/RosterList";
import { StudentForm } from "@/components/id-card/StudentForm";
import { SchoolInfoForm } from "@/components/id-card/SchoolInfoForm";
import { BulkImport } from "@/components/id-card/BulkImport";
import { Toolbar } from "@/components/id-card/Toolbar";
import { IDCardRenderer } from "@/components/id-card/TemplateRegistry";
import { CardGrid } from "@/components/id-card/CardGrid";
import { exportSheetsToPdf, exportSingleCardToPdf, printNode } from "@/lib/export";
import { sampleStudents } from "@/lib/sample-data";
import { defaultSchoolInfo, emptyStudent, Student, TemplateId, CodeType } from "@/lib/types";

type Mode = "single" | "bulk";

export default function IdCardsPage() {
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [selectedId, setSelectedId] = useState<string | null>(sampleStudents[0]?.id ?? null);
  const [school, setSchool] = useState(defaultSchoolInfo);
  const [templateId, setTemplateId] = useState<TemplateId>("modern");
  const [codeType, setCodeType] = useState<CodeType>("qr");
  const [side, setSide] = useState<"front" | "back">("front");
  const [mode, setMode] = useState<Mode>("single");
  const [isExporting, setIsExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const singleFrontRef = useRef<HTMLDivElement>(null);
  const singleBackRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => students.find((s) => s.id === selectedId) ?? null,
    [students, selectedId]
  );

  const updateSelected = (next: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  };

  const addStudent = () => {
    const s = emptyStudent();
    setStudents((prev) => [...prev, s]);
    setSelectedId(s.id);
    setMode("single");
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleImport = (imported: Student[]) => {
    setStudents((prev) => [...prev, ...imported]);
    setMode("bulk");
  };

  const handlePrint = () => printNode();

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      if (mode === "single" && selected && singleFrontRef.current) {
        await exportSingleCardToPdf(
          singleFrontRef.current,
          `${selected.name || "student"}-id-card.pdf`,
          singleBackRef.current
        );
      } else if (printRef.current) {
        await exportSheetsToPdf(printRef.current, "student-id-cards.pdf");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout
      title="Student ID Card Studio"
      subtitle="Design, generate, and print ID cards — one at a time or in bulk."
    >
      <div className="mx-auto max-w-7xl">
        {/* Mode toggle — page-specific action, not part of AppLayout's topbar */}
        <div className="no-print mb-4 flex items-center justify-end">
          <div className="flex items-center gap-1.5 rounded-lg bg-ink-100 p-1">
            {(["single", "bulk"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  "rounded-md px-3.5 py-1.5 text-xs font-medium capitalize transition",
                  mode === m ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"
                )}
              >
                {m === "single" ? "Single card" : "Bulk & print"}
              </button>
            ))}
          </div>
        </div>

        <div className="no-print mb-4">
          <Toolbar
            templateId={templateId}
            onTemplateChange={setTemplateId}
            codeType={codeType}
            onCodeTypeChange={setCodeType}
            side={side}
            onSideChange={setSide}
            onPrint={handlePrint}
            onDownloadPdf={handleDownloadPdf}
            isExporting={isExporting}
          />
        </div>

        {mode === "single" ? (
          <div className="grid grid-cols-12 gap-5">
            <aside className="no-print col-span-3 rounded-xl border border-ink-100 bg-white p-3 shadow-card">
              <RosterList
                students={students}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onAdd={addStudent}
                onRemove={removeStudent}
              />
            </aside>

            <section className="no-print col-span-5 space-y-5">
              {selected ? (
                <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Student details
                  </p>
                  <StudentForm student={selected} onChange={updateSelected} />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-400">
                  Select a student from the roster, or add a new one.
                </div>
              )}

              <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  School information
                </p>
                <SchoolInfoForm school={school} onChange={setSchool} />
              </div>

              <BulkImport onImport={handleImport} />
            </section>

            <section className="col-span-4">
              <div className="sticky top-6 flex flex-col items-center gap-4 rounded-xl border border-ink-100 bg-white p-6 shadow-card">
                <p className="no-print self-start text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Live preview
                </p>
                {selected ? (
                  <div id="print-root" className="flex flex-col items-center gap-3">
                    <IDCardRenderer
                      ref={singleFrontRef}
                      templateId={templateId}
                      student={selected}
                      school={school}
                      side="front"
                      codeType={codeType}
                    />
                    <IDCardRenderer
                      ref={singleBackRef}
                      templateId={templateId}
                      student={selected}
                      school={school}
                      side="back"
                      codeType={codeType}
                    />
                  </div>
                ) : (
                  <p className="py-16 text-sm text-ink-400">Nothing to preview yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="no-print rounded-xl border border-ink-100 bg-white p-4 shadow-card">
              <BulkImport onImport={handleImport} />
            </div>
            <div className="no-print rounded-xl border border-ink-100 bg-white p-3 shadow-card">
              <RosterList
                students={students}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setMode("single");
                }}
                onAdd={addStudent}
                onRemove={removeStudent}
              />
            </div>
            <div className="rounded-xl border border-ink-100 bg-ink-100/40 p-4">
              <p className="no-print mb-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
                {students.length} card{students.length === 1 ? "" : "s"} · {side} side · 8 per sheet
              </p>
              <CardGrid
                ref={printRef}
                students={students}
                school={school}
                templateId={templateId}
                codeType={codeType}
                side={side}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}