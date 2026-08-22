"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ChevronDown,
  Check,
  X,
  History,
  Users,
  CalendarClock,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

export type PromotionStatus = "Promoted" | "Pending" | "Not Promoted";
export type PromotionDecision = "Promote" | "Retain";

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  currentClass: string;
  section: string;
  academicYear: string;
  status: PromotionStatus;
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  fromClass: string;
  toClass: string;
  academicYear: string;
  date: string;
  status: PromotionStatus;
}

const CLASS_SEQUENCE: string[] = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
];

const ACADEMIC_YEARS: string[] = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

function nextClass(current: string): string {
  const idx = CLASS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx === CLASS_SEQUENCE.length - 1) return current;
  return CLASS_SEQUENCE[idx + 1];
}

function nextAcademicYear(year: string): string {
  const idx = ACADEMIC_YEARS.indexOf(year);
  if (idx === -1 || idx === ACADEMIC_YEARS.length - 1) return year;
  return ACADEMIC_YEARS[idx + 1];
}

const INITIAL_STUDENTS: Student[] = [
  { id: "s1", name: "Aarav Sharma", rollNo: "STU-1042", currentClass: "Class 6", section: "A", academicYear: "2025-2026", status: "Pending" },
  { id: "s2", name: "Diya Verma", rollNo: "STU-1043", currentClass: "Class 6", section: "A", academicYear: "2025-2026", status: "Pending" },
  { id: "s3", name: "Kabir Singh", rollNo: "STU-1044", currentClass: "Class 6", section: "B", academicYear: "2025-2026", status: "Not Promoted" },
  { id: "s4", name: "Ananya Rawat", rollNo: "STU-1045", currentClass: "Class 7", section: "A", academicYear: "2025-2026", status: "Pending" },
  { id: "s5", name: "Vihaan Negi", rollNo: "STU-1046", currentClass: "Class 7", section: "A", academicYear: "2025-2026", status: "Promoted" },
  { id: "s6", name: "Ishita Rana", rollNo: "STU-1047", currentClass: "Class 7", section: "B", academicYear: "2025-2026", status: "Pending" },
  { id: "s7", name: "Reyansh Bisht", rollNo: "STU-1048", currentClass: "Class 8", section: "A", academicYear: "2025-2026", status: "Pending" },
  { id: "s8", name: "Myra Chauhan", rollNo: "STU-1049", currentClass: "Class 8", section: "A", academicYear: "2025-2026", status: "Pending" },
  { id: "s9", name: "Arjun Thapa", rollNo: "STU-1050", currentClass: "Class 9", section: "A", academicYear: "2025-2026", status: "Not Promoted" },
  { id: "s10", name: "Saanvi Bhandari", rollNo: "STU-1051", currentClass: "Class 9", section: "B", academicYear: "2025-2026", status: "Pending" },
];

const INITIAL_HISTORY: PromotionRecord[] = [
  { id: "h1", studentId: "s5", studentName: "Vihaan Negi", rollNo: "STU-1046", fromClass: "Class 6", toClass: "Class 7", academicYear: "2024-2025", date: "2025-04-01", status: "Promoted" },
  { id: "h2", studentId: "s9", studentName: "Arjun Thapa", rollNo: "STU-1050", fromClass: "Class 8", toClass: "Class 9", academicYear: "2024-2025", date: "2025-04-01", status: "Not Promoted" },
  { id: "h3", studentId: "s3", studentName: "Kabir Singh", rollNo: "STU-1044", fromClass: "Class 5", toClass: "Class 6", academicYear: "2024-2025", date: "2025-04-01", status: "Not Promoted" },
  { id: "h4", studentId: "s1", studentName: "Aarav Sharma", rollNo: "STU-1042", fromClass: "Class 5", toClass: "Class 6", academicYear: "2024-2025", date: "2025-04-01", status: "Promoted" },
];

function StatusBadge({ status }: { status: PromotionStatus }) {
  const styles: Record<PromotionStatus, string> = {
    Promoted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    "Not Promoted": "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface PendingItem {
  student: Student;
  targetClass: string;
  decision: PromotionDecision;
}

function PromotionDialog({
  items,
  academicYearFrom,
  academicYearTo,
  onChangeDecision,
  onConfirm,
  onClose,
}: {
  items: PendingItem[];
  academicYearFrom: string;
  academicYearTo: string;
  onChangeDecision: (studentId: string, decision: PromotionDecision) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const promoteCount = items.filter((i) => i.decision === "Promote").length;
  const retainCount = items.length - promoteCount;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Confirm Promotion</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarClock className="h-3.5 w-3.5" />
              Academic year {academicYearFrom}
              <ArrowRight className="h-3 w-3" />
              {academicYearTo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="mb-3 text-xs text-slate-500">
            {items.length} student{items.length !== 1 ? "s" : ""} selected. Review each
            student's target class, or mark them as retained.
          </p>

          <ul className="divide-y divide-slate-100">
            {items.map(({ student, targetClass, decision }) => (
              <li key={student.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{student.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <span>{student.rollNo}</span>
                    <span>·</span>
                    <span>{student.currentClass}</span>
                    {decision === "Promote" && (
                      <>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium text-indigo-600">{targetClass}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onChangeDecision(student.id, "Promote")}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      decision === "Promote"
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Promote
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeDecision(student.id, "Retain")}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      decision === "Retain"
                        ? "bg-rose-600 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    Retain
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{promoteCount} promote</span>
            {retainCount > 0 && (
              <>
                {" "}
                · <span className="font-semibold text-rose-600">{retainCount} retain</span>
              </>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Check className="h-3.5 w-3.5" />
              Confirm Promotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionHistoryTable({ history }: { history: PromotionRecord[] }) {
  const [yearFilter, setYearFilter] = useState<string>("All");

  const filtered = useMemo(
    () => (yearFilter === "All" ? history : history.filter((h) => h.academicYear === yearFilter)),
    [history, yearFilter]
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-900">Promotion History</h2>
        </div>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option value="All">All academic years</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-2.5">Student</th>
              <th className="px-5 py-2.5">From</th>
              <th className="px-5 py-2.5">To</th>
              <th className="px-5 py-2.5">Academic Year</th>
              <th className="px-5 py-2.5">Date</th>
              <th className="px-5 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                  No promotion records for this academic year.
                </td>
              </tr>
            ) : (
              filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{h.studentName}</p>
                    <p className="text-xs text-slate-400">{h.rollNo}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{h.fromClass}</td>
                  <td className="px-5 py-3 text-slate-600">{h.toClass}</td>
                  <td className="px-5 py-3 text-slate-600">{h.academicYear}</td>
                  <td className="px-5 py-3 text-slate-500">{h.date}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={h.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StudentPromotion() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [history, setHistory] = useState<PromotionRecord[]>(INITIAL_HISTORY);

  const [academicYearFrom] = useState<string>("2025-2026");
  const [academicYearTo, setAcademicYearTo] = useState<string>(nextAcademicYear("2025-2026"));

  const [classFilter, setClassFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetOverrides, setTargetOverrides] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, PromotionDecision>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const classOptions = useMemo(
    () => ["All", ...Array.from(new Set(students.map((s) => s.currentClass)))],
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = classFilter === "All" || s.currentClass === classFilter;
      const matchesSearch =
        search.trim() === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [students, classFilter, search]);

  const allVisibleSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selectedIds.has(s.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredStudents.forEach((s) => next.delete(s.id));
      } else {
        filteredStudents.forEach((s) => next.add(s.id));
      }
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function targetClassFor(student: Student): string {
    return targetOverrides[student.id] ?? nextClass(student.currentClass);
  }

  function decisionFor(id: string): PromotionDecision {
    return decisions[id] ?? "Promote";
  }

  const pendingItems: PendingItem[] = useMemo(
    () =>
      students
        .filter((s) => selectedIds.has(s.id))
        .map((student) => ({
          student,
          targetClass: targetClassFor(student),
          decision: decisionFor(student.id),
        })),
    [students, selectedIds, targetOverrides, decisions]
  );

  function handleConfirmPromotion() {
    const today = new Date().toISOString().slice(0, 10);

    setStudents((prev) =>
      prev.map((s) => {
        const item = pendingItems.find((p) => p.student.id === s.id);
        if (!item) return s;
        if (item.decision === "Promote") {
          return { ...s, currentClass: item.targetClass, academicYear: academicYearTo, status: "Promoted" };
        }
        return { ...s, academicYear: academicYearTo, status: "Not Promoted" };
      })
    );

    setHistory((prev) => [
      ...pendingItems.map((item, i) => ({
        id: `h-${Date.now()}-${i}`,
        studentId: item.student.id,
        studentName: item.student.name,
        rollNo: item.student.rollNo,
        fromClass: item.student.currentClass,
        toClass: item.decision === "Promote" ? item.targetClass : item.student.currentClass,
        academicYear: academicYearTo,
        date: today,
        status: item.decision === "Promote" ? ("Promoted" as const) : ("Not Promoted" as const),
      })),
      ...prev,
    ]);

    setSelectedIds(new Set());
    setTargetOverrides({});
    setDecisions({});
    setDialogOpen(false);
  }

  return (
    <AppLayout
      title="Student Promotion"
      subtitle="Promote students to the next class for a new academic year."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Academic year selector — page-specific control, title/subtitle now live in AppLayout */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <CalendarClock className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-600">{academicYearFrom}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <div className="relative">
              <select
                value={academicYearTo}
                onChange={(e) => setAcademicYearTo(e.target.value)}
                className="appearance-none rounded-md bg-transparent pr-5 font-semibold text-indigo-600 focus:outline-none"
              >
                {ACADEMIC_YEARS.filter((y) => y !== academicYearFrom).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or roll no."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All classes" : c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setDialogOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Users className="h-4 w-4" />
            Promote Selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </button>
        </div>

        {/* Student list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="w-10 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible students"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Current Class</th>
                  <th className="px-5 py-3">Target Class</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-400">
                      No students match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const checked = selectedIds.has(s.id);
                    return (
                      <tr key={s.id} className={checked ? "bg-indigo-50/40" : "hover:bg-slate-50"}>
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(s.id)}
                            aria-label={`Select ${s.name}`}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">
                            {s.rollNo} · Section {s.section}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{s.currentClass}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                            <select
                              value={targetClassFor(s)}
                              onChange={(e) =>
                                setTargetOverrides((prev) => ({ ...prev, [s.id]: e.target.value }))
                              }
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                              {CLASS_SEQUENCE.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={s.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotion history */}
        <PromotionHistoryTable history={history} />
      </div>

      {/* Confirmation dialog */}
      {dialogOpen && (
        <PromotionDialog
          items={pendingItems}
          academicYearFrom={academicYearFrom}
          academicYearTo={academicYearTo}
          onChangeDecision={(id, decision) =>
            setDecisions((prev) => ({ ...prev, [id]: decision }))
          }
          onConfirm={handleConfirmPromotion}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </AppLayout>
  );
}