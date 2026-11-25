"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, FilePlus2, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApplicationActions } from "@/components/admission/application-actions";
import { PageHeader } from "@/components/admission/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/admission/states";
import { StatusBadge } from "@/components/admission/status-badge";
import { StudentAvatar } from "@/components/admission/student-avatar";
import { ACADEMIC_SESSIONS, COURSES, STATUSES } from "@/lib/admission/constants";
import { formatDate } from "@/lib/admission/format";
import { useAdmissions } from "@/lib/admission/store";
import type { Application } from "@/lib/admission/types";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "./filters";
import { Pagination } from "./pagination";
import { RowActions } from "./row-actions";

type SortKey = "id" | "fullName" | "course" | "mobile" | "applicationDate" | "status";

type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: "id", label: "Application ID"},
  { key: "fullName", label: "Student"},
  { key: "course", label: "Course" },
  { key: "mobile", label: "Mobile" },
  { key: "applicationDate", label: "Applied on" },
  { key: "status", label: "Status" },
];

function compare(a: Application, b: Application, key: SortKey) {
  if (key === "status") return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
  return String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true, sensitivity: "base" });
}

function initialFilters(params: URLSearchParams): Filters {
  const status = params.get("status");
  const course = params.get("course");
  const session = params.get("session");
  return {
    ...DEFAULT_FILTERS,
    q: params.get("q") ?? "",
    status: status && (STATUSES as readonly string[]).includes(status) ? status : "all",
    course: course && COURSES.some((c) => c.name === course) ? course : "all",
    session: session && (ACADEMIC_SESSIONS as readonly string[]).includes(session) ? session : "all",
  };
}

export function ApplicationsView() {
  const params = useSearchParams();

  const { applications, state, error, retry } = useAdmissions();

  const actions = useApplicationActions();

  const [filters, setFilters] = React.useState<Filters>(() => initialFilters(params));

  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: "applicationDate", dir: "desc" });
  
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const paramString = params.toString();
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setFilters(initialFilters(new URLSearchParams(paramString)));
    setPage(1);
  }, [paramString]);

  const patchFilters = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const filtered = React.useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const validRange = !(filters.from && filters.to && filters.from > filters.to);
    const from = validRange && filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : null;
    const to = validRange && filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : null;
    const rows = applications.filter((a) => {
      if (q && !a.fullName.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q)) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.course !== "all" && a.course !== filters.course) return false;
      if (filters.session !== "all" && a.session !== filters.session) return false;
      const t = new Date(a.applicationDate).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
    rows.sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b, sort.key));
    return rows;
  }, [applications, filters, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "applicationDate" ? "desc" : "asc" }));
    setPage(1);
  };

  const header = (
    <PageHeader
      title="Applications"
      description="Search, review and decide on every admission application."
      actions={
        <Button>
          <Link href="/admission/new" style={{ display: "flex", alignItems: "center", gap: 4, color: "inherit", textDecoration: "none" }}>
            <Plus /> New Admission
          </Link>
        </Button>
      }
    />
  );

  if (state === "error") {
    return (
      <>
        {header}
        <ErrorState title="Couldn't load applications" message={error} onRetry={retry} />
      </>
    );
  }
  const loading = state === "loading";
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  return (
    <>
      {header}
      <Card className="gap-0 overflow-hidden py-0">
        <FilterBar filters={filters} onChange={patchFilters} onClear={clearFilters} />
        {loading ? (
          <TableSkeleton rows={8} />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FilePlus2}
            title="No applications yet"
            description="Start by creating your first admission application."
            action={
              <Link
                href="/admission/new"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                New Admission
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No applications match your filters"
            description="Try a different search term or clear the filters to see everything."
            action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {COLUMNS.map((c) => {
                      const active = sort.key === c.key;
                      const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                      return (
                        <TableHead key={c.key} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                          <button
                            type="button"
                            onClick={() => toggleSort(c.key)}
                            className="-ml-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 uppercase hover:text-foreground"
                          >
                            {c.label}
                            <Icon className={active ? "size-3.5 text-primary" : "size-3.5 opacity-50"} />
                          </button>
                        </TableHead>
                      );
                    })}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-[13px] text-muted-foreground">{a.id}</TableCell>
                      <TableCell>
                        <Link href={`/admission/${a.id}`} className="group flex items-center gap-3">
                          <StudentAvatar name={a.fullName} src={a.photo?.dataUrl} />
                          <span className="font-medium group-hover:text-primary">{a.fullName}</span>
                        </Link>
                      </TableCell>
                      <TableCell>{a.course}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{a.mobile}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(a.applicationDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell>
                        <RowActions app={a} actions={actions} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="divide-y md:hidden">
              {rows.map((a) => (
                <li key={a.id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <StudentAvatar name={a.fullName} src={a.photo?.dataUrl} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/admission/${a.id}`} className="block truncate font-medium">
                        {a.fullName}
                      </Link>
                      <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Course</dt>
                    <dd className="text-right">{a.course}</dd>
                    <dt className="text-muted-foreground">Mobile</dt>
                    <dd className="text-right tabular-nums">{a.mobile}</dd>
                    <dt className="text-muted-foreground">Applied</dt>
                    <dd className="text-right">{formatDate(a.applicationDate)}</dd>
                  </dl>
                  <RowActions app={a} actions={actions} />
                </li>
              ))}
            </ul>
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={(p) => setPage(Math.min(Math.max(1, p), pages))}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </Card>
      {actions.dialogs}
    </>
  );
}
