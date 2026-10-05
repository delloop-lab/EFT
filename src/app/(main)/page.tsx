"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { formatDate, formatEventDate, greetingForNow, todayIsoDate } from "@/lib/format";

export default function HomePage() {
  const {
    currentUser,
    getPosts,
    getDiscussions,
    getComments,
    getEvents,
    getNotifications,
    unreadCount,
  } = useDataStore();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (currentUser) setGreeting(greetingForNow(currentUser.name));
  }, [currentUser]);

  if (!currentUser) return null;

  const announcements = getPosts("published").filter((p) => p.isAnnouncement).slice(0, 2);
  const latestNews = getPosts("published").slice(0, 5);
  const recentDiscussions = getDiscussions().slice(0, 5);
  const upcomingEvents = getEvents()
    .filter((e) => e.date >= todayIsoDate())
    .slice(0, 3);
  const following = getDiscussions().filter((d) => d.followers.includes(currentUser.id)).slice(0, 4);
  const myPosts = getDiscussions().filter((d) => d.authorId === currentUser.id).slice(0, 3);
  const unread = getNotifications().filter((n) => !n.read).slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-up">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--blue)]">Member hub</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
            {greeting || `Welcome, ${currentUser.name.split(" ")[0]}`}
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Official news, member discussions and events — follow only what matters to you.
          </p>
        </div>
        <Link href="/submit" className="btn-primary">
          Have something to share?
        </Link>
      </section>

      {announcements.length > 0 && (
        <section className="card border-[var(--navy)]/15 bg-gradient-to-br from-white to-[var(--surface-muted)] p-5">
          <h2 className="section-title">Important announcements</h2>
          <div className="space-y-3">
            {announcements.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.id}`}
                className="block rounded-lg border border-[var(--border)] bg-white p-4 transition hover:border-[var(--blue)]"
              >
                <div className="flex items-center gap-2">
                  <span className="badge badge-amber">Announcement</span>
                  <span className="text-xs text-[var(--muted)]">{formatDate(post.date)}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">{post.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{post.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title mb-0">Latest news</h2>
            <Link href="/news" className="text-sm font-medium text-[var(--blue)]">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {latestNews.map((post) => (
              <li key={post.id}>
                <Link href={`/news/${post.id}`} className="block py-3 hover:opacity-90">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--navy)]">{post.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{post.summary}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--muted)]">{formatDate(post.date)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title mb-0">Upcoming events</h2>
            <Link href="/events" className="text-sm font-medium text-[var(--blue)]">
              All
            </Link>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="rounded-lg border border-[var(--border)] p-3">
                <Link href={`/events/${event.id}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--green-deep)]">
                    {formatEventDate(event.date)}
                  </div>
                  <div className="mt-1 font-semibold text-[var(--navy)]">{event.name}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {event.time} · {event.location}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title mb-0">Recent discussions</h2>
            <Link href="/discussions" className="text-sm font-medium text-[var(--blue)]">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {recentDiscussions.map((disc) => {
              const count = getComments(disc.id).length;
              return (
                <li key={disc.id}>
                  <Link href={`/discussions/${disc.id}`} className="block py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--navy)]">{disc.title}</h3>
                        <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{disc.body}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-[var(--surface-muted)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                        {count} comment{count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="section-title">Your activity</h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)]">Discussions I follow</h3>
              <ul className="mt-2 space-y-1.5">
                {following.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">You’re not following any yet.</li>
                )}
                {following.map((d) => (
                  <li key={d.id}>
                    <Link href={`/discussions/${d.id}`} className="text-sm font-medium text-[var(--navy)] hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)]">My recent posts</h3>
              <ul className="mt-2 space-y-1.5">
                {myPosts.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">No discussions started yet.</li>
                )}
                {myPosts.map((d) => (
                  <li key={d.id}>
                    <Link href={`/discussions/${d.id}`} className="text-sm font-medium text-[var(--navy)] hover:underline">
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--muted)]">Unread notifications</h3>
                {unreadCount > 0 && (
                  <Link href="/notifications" className="text-xs font-medium text-[var(--blue)]">
                    {unreadCount} unread
                  </Link>
                )}
              </div>
              <ul className="mt-2 space-y-2">
                {unread.length === 0 && (
                  <li className="text-sm text-[var(--muted)]">You’re all caught up.</li>
                )}
                {unread.map((n) => (
                  <li key={n.id} className="text-sm text-[var(--text)]">
                    {n.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
