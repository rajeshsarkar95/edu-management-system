"use client";

import Link from "next/link";
import { CheckCircle2, Eye, FileSearch, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Application } from "@/lib/admission/types";
import type { useApplicationActions } from "@/components/admission/application-actions";

export function RowActions({ app, actions }: { app: Application; actions: ReturnType<typeof useApplicationActions> }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="icon-sm" aria-label={`View ${app.fullName}`} title="View">
        <Link href={`/admission/${app.id}`}>
          <Eye />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${app.fullName}`} title="Edit">
        <Link href={`/admission/${app.id}/edit`}>
          <Pencil />
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${app.fullName}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {app.status === "pending" && (
            <DropdownMenuItem onSelect={() => actions.markUnderReview(app)}>
              <FileSearch /> Mark under review
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled={app.status === "approved"} onSelect={() => actions.approve(app)}>
            <CheckCircle2 className="text-success" /> Approve
          </DropdownMenuItem>
          <DropdownMenuItem disabled={app.status === "rejected"} onSelect={() => actions.reject(app)}>
            <XCircle className="text-destructive" /> Reject
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => actions.remove(app)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
