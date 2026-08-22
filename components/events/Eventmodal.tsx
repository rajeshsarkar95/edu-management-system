"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/config/eventCategories";
import { toISODate } from "@/lib/data/events";
import type { EventCategory, NewEventInput, SchoolEvent } from "@/lib/types/event";

interface EventModalProps {
  open: boolean;
  initialEvent?: SchoolEvent | null;
  defaultDate?: string | null;
  onClose: () => void;
  onSave: (event: NewEventInput) => void;
  onDelete?: (eventId: string) => void;
}

const EMPTY_FORM: NewEventInput = {
  title: "",
  description: "",
  category: "academic",
  date: toISODate(new Date()),
  startTime: "",
  endTime: "",
  location: "",
  audience: [],
  reminder: { enabled: true, minutesBefore: 60 },
  notify: true,
};

export default function EventModal({
  open,
  initialEvent,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) {
  const [form, setForm] = useState<NewEventInput>(EMPTY_FORM);

  useEffect(() => {
    if (initialEvent) {
      setForm(initialEvent);
    } else {
      setForm({ ...EMPTY_FORM, date: defaultDate ?? toISODate(new Date()) });
    }
  }, [initialEvent, defaultDate, open]);

  if (!open) return null;

  const isEdit = Boolean(initialEvent);

  const submit = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, id: initialEvent?.id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isEdit ? "Edit Event" : "Add Event"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Parent–Teacher Meeting"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Optional details"
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_ORDER.map((cat: EventCategory) => {
                const meta = CATEGORY_META[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                      active ? `text-white ${meta.accent}` : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {meta.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Main Auditorium"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Audience (comma separated)
            </label>
            <input
              value={form.audience?.join(", ") ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  audience: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. Class 9, Class 10"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-700">Reminder</p>
              <p className="text-xs text-slate-400">Get pinged before this event starts</p>
            </div>
            <input
              type="checkbox"
              checked={form.reminder.enabled}
              onChange={(e) =>
                setForm({ ...form, reminder: { ...form.reminder, enabled: e.target.checked } })
              }
              className="h-4 w-4 accent-indigo-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-700">Notify audience</p>
              <p className="text-xs text-slate-400">Send an in-app / email notification</p>
            </div>
            <input
              type="checkbox"
              checked={form.notify}
              onChange={(e) => setForm({ ...form, notify: e.target.checked })}
              className="h-4 w-4 accent-indigo-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          {isEdit && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(initialEvent!.id);
                onClose();
              }}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!form.title.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {isEdit ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}