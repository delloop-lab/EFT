"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { formatEventDate } from "@/lib/format";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { getEvents, canManageEvents, updateEvent } = useDataStore();
  const event = getEvents().find((e) => e.id === params.id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);

  if (!event || !form) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <Link href="/events" className="mt-4 inline-block text-[var(--blue)]">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link href="/events" className="text-sm font-medium text-[var(--blue)]">
        ← Back to events
      </Link>
      <div className="card mt-4 p-6 sm:p-8">
        {!editing ? (
          <>
            <div className="text-sm font-semibold uppercase tracking-wide text-[var(--green-deep)]">
              {formatEventDate(event.date)} · {event.time}
            </div>
            <h1 className="mt-2 text-3xl font-semibold">{event.name}</h1>
            <p className="mt-2 text-[var(--muted)]">{event.location}</p>
            <div className="prose-body mt-6">{event.description}</div>
            {canManageEvents && (
              <button
                type="button"
                className="btn-secondary mt-6"
                onClick={() => {
                  setForm(event);
                  setEditing(true);
                }}
              >
                Edit event
              </button>
            )}
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateEvent(event.id, form);
              setEditing(false);
            }}
          >
            <h2 className="text-xl font-semibold">Edit event</h2>
            <div>
              <label className="label">Name</label>
              <input
                className="field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="field min-h-28"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Time</label>
                <input
                  type="time"
                  className="field"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  className="field"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
