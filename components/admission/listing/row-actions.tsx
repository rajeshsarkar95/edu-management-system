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
      <Link href={`/admission/${app.id}`} title="View" aria-label={`View ${app.fullName}`}> 
        <Button variant="ghost" size="icon">
          <Eye />
        </Button>
      </Link>
      <Link href={`/admission/${app.id}/edit`} title="Edit" aria-label={`Edit ${app.fullName}`}> 
        <Button variant="ghost" size="icon">
          <Pencil />
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`More actions for ${app.fullName}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
          <DropdownMenuItem onSelect={() => actions.remove(app)} className="text-destructive">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
