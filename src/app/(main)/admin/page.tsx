"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { formatDate, formatDateTime, todayIsoDate } from "@/lib/format";
import { TOTAL_ASSOCIATION_MEMBERS } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const {
    currentUser,
    canModerate,
    getPosts,
    getDiscussions,
    getComments,
    getEvents,
    getSubmissions,
    getMember,
    approveSubmission,
    rejectSubmission,
    resetDemo,
  } = useDataStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (currentUser && !canModerate) {
      router.replace("/home");
    }
  }, [currentUser, canModerate, router]);

  if (!currentUser || !canModerate) {
    return <div className="text-[var(--muted)]">Checking access…</div>;
  }

  const pending = getSubmissions("pending");
  const publishedNews = getPosts("published");
  const discussions = getDiscussions();
  const upcomingEvents = getEvents().filter((e) => e.date >= todayIsoDate());
  const recentComments = [...getComments()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  function startEdit(id: string, title: string, content: string) {
    setEditingId(id);
    setEditTitle(title);
    setEditContent(content);
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Admin</h1>
          <p className="mt-2 text-[var(--muted)]">
            Moderation and overview for the demonstration. Signed in as {currentUser.name}.
          </p>
        </div>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            if (
              confirm(
                "Reset the demo to the original sample data? This clears comments, follows, submissions and preferences created during the demonstration."
              )
            ) {
              resetDemo();
              alert("Demo data has been restored.");
            }
          }}
        >
          Reset Demo
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Members" value={TOTAL_ASSOCIATION_MEMBERS.toLocaleString("en-GB")} />
        <Stat label="Published news" value={String(publishedNews.length)} />
        <Stat label="Active discussions" value={String(discussions.length)} />
        <Stat label="Upcoming events" value={String(upcomingEvents.length)} />
        <Stat label="Pending submissions" value={String(pending.length)} />
      </div>

      <section className="card p-5">
        <h2 className="section-title">Pending submissions</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No submissions waiting for review.</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((sub) => {
              const author = getMember(sub.authorId);
              const isEditing = editingId === sub.id;
              return (
                <li key={sub.id} className="rounded-lg border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-amber">Pending</span>
                    <span className="badge">{sub.type}</span>
                    <span className="text-xs text-[var(--muted)]">{formatDateTime(sub.date)}</span>
                  </div>
                  {!isEditing ? (
                    <>
                      <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">{sub.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Submitted by {author?.name ?? "Unknown"}
                      </p>
                      <p className="mt-3 text-sm text-[var(--text)] line-clamp-4">{sub.content}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => approveSubmission(sub.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => {
                            if (confirm("Reject this submission?")) rejectSubmission(sub.id);
                          }}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => startEdit(sub.id, sub.title, sub.content)}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="label">Title</label>
                        <input
                          className="field"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="label">Content</label>
                        <textarea
                          className="field min-h-32"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => {
                            approveSubmission(sub.id, {
                              title: editTitle.trim(),
                              content: editContent.trim(),
                            });
                            setEditingId(null);
                          }}
                        >
                          Save & approve
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title">Recent activity</h2>
          <ul className="space-y-2 text-sm">
            {discussions.slice(0, 6).map((d) => (
              <li key={d.id} className="flex justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
                <Link href={`/discussions/${d.id}`} className="font-medium text-[var(--navy)] hover:underline">
                  {d.title}
                </Link>
                <span className="shrink-0 text-[var(--muted)]">{formatDate(d.updatedAt)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="section-title">Recent comments</h2>
          <ul className="space-y-3">
            {recentComments.map((c) => {
              const author = getMember(c.authorId);
              return (
                <li key={c.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                  <div className="text-sm font-medium text-[var(--navy)]">
                    {author?.name ?? "Unknown"}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{c.body}</p>
                  <Link
                    href={`/discussions/${c.discussionId}`}
                    className="mt-1 inline-block text-xs font-medium text-[var(--blue)]"
                  >
                    View discussion
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="section-title">Upcoming events</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-3 font-semibold">Event</th>
                <th className="py-2 pr-3 font-semibold">Date</th>
                <th className="py-2 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((event) => (
                <tr key={event.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3">
                    <Link href={`/events/${event.id}`} className="font-medium text-[var(--navy)] hover:underline">
                      {event.name}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {event.date} · {event.time}
                  </td>
                  <td className="py-2.5 text-[var(--muted)]">{event.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-semibold text-[var(--navy)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}
