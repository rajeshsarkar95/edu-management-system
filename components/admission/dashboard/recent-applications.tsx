"use client";

import Link from "next/link";
import { ArrowRight, Eye, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, TableSkeleton } from "@/components/admission/states";
import { StatusBadge } from "@/components/admission/status-badge";
import { StudentAvatar } from "@/components/admission/student-avatar";
import { formatDate } from "@/lib/admission/format";
import type { Application } from "@/lib/admission/types";

export function RecentApplications({ apps, loading }: { apps: Application[]; loading?: boolean }) {
  const recent = apps.slice(0, 6);
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex-row items-center justify-between gap-4 border-b py-5">
        <div className="space-y-1">
          <CardTitle>Recent applications</CardTitle>
          <CardDescription>The latest submissions across all courses</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Link href="/admission/applications">
            View all <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
      {loading ? (
        <TableSkeleton rows={5} />
      ) : recent.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="No applications yet"
          description="Create the first admission application to see it here."
          action={
            <Button>
              <Link href="/admission/new">New Admission</Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Course</TableHead>
              <TableHead className="hidden sm:table-cell">Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  <Link href={`/admission/${a.id}`} className="flex items-center gap-3">
                    <StudentAvatar name={a.fullName} src={a.photo?.dataUrl} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.fullName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{a.id}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{a.course}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(a.applicationDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={a.status} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" aria-label={`View ${a.fullName}`}>
                    <Link href={`/admission/${a.id}`}>
                      <Eye />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
