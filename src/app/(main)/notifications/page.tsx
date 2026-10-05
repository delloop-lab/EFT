"use client";

import Link from "next/link";
import { useDataStore } from "@/lib/data-store";
import { formatDateTime } from "@/lib/format";

function relatedHref(type?: string, id?: string) {
  if (!type || !id) return null;
  switch (type) {
    case "discussion":
      return `/discussions/${id}`;
    case "news":
      return `/news/${id}`;
    case "event":
      return `/events/${id}`;
    case "member":
      return `/members/${id}`;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
  } = useDataStore();
  const notifications = getNotifications();

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <p className="mt-2 text-[var(--muted)]">
            In-app only for this demo — no emails are sent. You are notified about discussions you follow, not every conversation in the association.
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn-secondary" onClick={markAllNotificationsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {notifications.length === 0 && (
          <li className="card p-5 text-sm text-[var(--muted)]">No notifications yet.</li>
        )}
        {notifications.map((n) => {
          const href = relatedHref(n.relatedType, n.relatedId);
          return (
            <li
              key={n.id}
              className={`card p-4 ${n.read ? "opacity-80" : "border-[var(--blue)]/40 bg-[var(--surface-muted)]"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{n.type.replace(/_/g, " ")}</span>
                {!n.read && <span className="badge badge-green">Unread</span>}
                <span className="text-xs text-[var(--muted)]">{formatDateTime(n.date)}</span>
              </div>
              <h2 className="mt-2 font-semibold text-[var(--navy)]">{n.title}</h2>
              <p className="mt-1 text-sm text-[var(--text)]">{n.message}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {href && (
                  <Link
                    href={href}
                    className="font-medium text-[var(--blue)]"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    View related content
                  </Link>
                )}
                {!n.read && (
                  <button
                    type="button"
                    className="font-medium text-[var(--muted)]"
                    onClick={() => markNotificationRead(n.id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
