"use client";

import { useMemo, useState } from "react";
import { SEED_EVENTS, toISODate } from "@/lib/data/events";
import type {
  DateRangeFilter,
  EventFilter,
  NewEventInput,
  SchoolEvent,
} from "@/lib/types/event";
import AppLayout from "@/components/layout/AppLayout";
import EventsHeader from "@/components/events/Eventsheader";
import EventFilters from "@/components/events/Eventfilters";
import CalendarView from "@/components/events/Calendarview";
import EventList from "@/components/events/Eventlist";
import EventReminders from "@/components/events/Eventreminders";
import EventModal from "@/components/events/Eventmodal";

export default function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>(SEED_EVENTS);
  const [category, setCategory] = useState<EventFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("upcoming");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const todayISO = toISODate(new Date())
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (category !== "all" && evt.category !== category) return false;
      if (selectedDate && evt.date !== selectedDate) return false;
      if (dateRange === "upcoming" && evt.date < todayISO) return false;
      if (dateRange === "past" && evt.date >= todayISO) return false;
      if (dateRange === "this-month") {
        const now = new Date();
        const evtDate = new Date(`${evt.date}T00:00:00`);
        if (
          evtDate.getFullYear() !== now.getFullYear() ||
          evtDate.getMonth() !== now.getMonth()
        ) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${evt.title} ${evt.description ?? ""} ${evt.location ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, category, dateRange, search, selectedDate, todayISO]);

  const openAddModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };
  const openEditModal = (evt: SchoolEvent) => {
    setEditingEvent(evt);
    setModalOpen(true);
  };
  const handleSave = (input: NewEventInput) => {
    if (input.id) {
      setEvents((prev) => prev.map((e) => (e.id === input.id ? { ...(input as SchoolEvent) } : e)));
    } else {
      const newEvent: SchoolEvent = { ...input, id: `evt-${crypto.randomUUID()}` };
      setEvents((prev) => [...prev, newEvent]);
    }
  };
  const handleDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };
  const toggleReminder = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId ? { ...e, reminder: { ...e.reminder, enabled: !e.reminder.enabled } } : e
      )
    );
  };
  const toggleNotify = (eventId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, notify: !e.notify } : e)));
  };

  return (
    <AppLayout
      title="Events & Calendar"
      subtitle="Academic calendar, holidays, meetings and exam dates in one place."
    >
      <div className="space-y-6">
        <EventsHeader events={events} onAddEvent={openAddModal} />

        <EventFilters
          activeCategory={category}
          onCategoryChange={setCategory}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          search={search}
          onSearchChange={setSearch}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar: calendar + reminders */}
          <div className="space-y-6">
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onSelectDate={(iso) => setSelectedDate(iso === selectedDate ? null : iso)}
            />
            <EventReminders events={events} onToggleNotify={toggleNotify} />
          </div>

          {/* Main: agenda list */}
          <div className="lg:col-span-2">
            <EventList events={filteredEvents} onToggleReminder={toggleReminder} onEventClick={openEditModal} />
          </div>
        </div>
      </div>

      <EventModal
        open={modalOpen}
        initialEvent={editingEvent}
        defaultDate={selectedDate}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </AppLayout>
  );
}