"use client";

import Link from "next/link";
import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { formatEventDate, todayIsoDate } from "@/lib/format";

export default function EventsPage() {
  const { getEvents, canManageEvents, createEvent, deleteEvent } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");

  const today = todayIsoDate();
  const events = getEvents();
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today).reverse();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !date || !location.trim()) return;
    const event = createEvent({
      name: name.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
    });
    setShowForm(false);
    setName("");
    setDescription("");
    setDate("");
    setLocation("");
    window.location.href = `/events/${event.id}`;
  }

  function EventList({ items, empty }: { items: typeof events; empty: string }) {
    if (items.length === 0) {
      return <p className="text-sm text-[var(--muted)]">{empty}</p>;
    }
    return (
      <ul className="space-y-3">
        {items.map((event) => (
          <li key={event.id} className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Link href={`/events/${event.id}`} className="min-w-0 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--green-deep)]">
                  {formatEventDate(event.date)} · {event.time}
                </div>
                <h3 className="mt-1 text-xl font-semibold text-[var(--navy)]">{event.name}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{event.description}</p>
                <p className="mt-2 text-sm text-[var(--text)]">{event.location}</p>
              </Link>
              {canManageEvents && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    if (confirm("Delete this event?")) deleteEvent(event.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Events</h1>
          <p className="mt-2 text-[var(--muted)]">
            Association gatherings, meetings and workshops.
          </p>
        </div>
        {canManageEvents && (
          <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Create event"}
          </button>
        )}
      </div>

      {showForm && canManageEvents && (
        <form onSubmit={handleCreate} className="card space-y-4 p-5">
          <h2 className="text-lg font-semibold">New event</h2>
          <div>
            <label className="label" htmlFor="evt-name">Name</label>
            <input id="evt-name" className="field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="evt-desc">Description</label>
            <textarea id="evt-desc" className="field min-h-28" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="evt-date">Date</label>
              <input id="evt-date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="evt-time">Time</label>
              <input id="evt-time" type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="evt-loc">Location</label>
              <input id="evt-loc" className="field" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save event</button>
        </form>
      )}

      <section>
        <h2 className="section-title">Upcoming events</h2>
        <EventList items={upcoming} empty="No upcoming events." />
      </section>

      <section>
        <h2 className="section-title">Past events</h2>
        <EventList items={past} empty="No past events." />
      </section>
    </div>
  );
}
