"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { roleLabel, useDataStore } from "@/lib/data-store";
import { formatDate, formatDateTime } from "@/lib/format";
import { resources } from "@/lib/resources";
import type { NotificationPreference } from "@/lib/types";

export default function AccountPage() {
  const {
    currentUser,
    getDiscussions,
    getSubmissions,
    getPreferences,
    getResourceActivity,
    updateProfile,
    updatePreferences,
  } = useDataStore();

  const user = currentUser;
  const prefs = getPreferences(user?.id);

  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [interests, setInterests] = useState(user?.interests.join(", ") ?? "");
  const [saved, setSaved] = useState(false);
  const [prefState, setPrefState] = useState<NotificationPreference>(prefs);

  if (!user) return null;

  const userId = user.id;
  const myDiscussions = getDiscussions().filter((d) => d.authorId === userId);
  const following = getDiscussions().filter((d) => d.followers.includes(userId));
  const mySubmissions = getSubmissions().filter((s) => s.authorId === userId);
  const myResourceActivity = getResourceActivity(userId);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile(userId, {
      bio: bio.trim(),
      location: location.trim(),
      interests: interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function togglePref(key: keyof NotificationPreference) {
    const next = { ...prefState, [key]: !prefState[key] };
    setPrefState(next);
    updatePreferences(userId, next);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-4">
        <Avatar member={user} size="lg" />
        <div>
          <h1 className="text-3xl font-semibold">My Account</h1>
          <p className="text-[var(--muted)]">
            {user.name} · {roleLabel(user.role)}
          </p>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="section-title">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Biography</label>
            <textarea className="field min-h-24" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Location</label>
              <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Interests (comma separated)</label>
              <input className="field" value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save profile</button>
            {saved && <span className="text-sm text-[var(--green-deep)]">Saved</span>}
          </div>
        </form>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="section-title mb-0">My resources</h2>
          <Link href="/resources" className="text-sm font-medium text-[var(--blue)]">
            Browse resources
          </Link>
        </div>
        <ul className="space-y-3">
          {myResourceActivity.length === 0 && (
            <li className="text-sm text-[var(--muted)]">
              You haven’t watched or downloaded any resources yet.
            </li>
          )}
          {myResourceActivity.map((activity) => {
            const resource = resources.find((r) => r.id === activity.resourceId);
            if (!resource) return null;
            return (
              <li
                key={activity.id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--border)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        activity.action === "watched" ? "badge badge-blue" : "badge badge-green"
                      }
                    >
                      {activity.action}
                    </span>
                    <span className="badge">{resource.kind}</span>
                  </div>
                  <div className="mt-1 font-semibold text-[var(--navy)]">{resource.title}</div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {formatDateTime(activity.date)}
                  </p>
                </div>
                <Link href="/resources" className="text-sm font-medium text-[var(--blue)]">
                  View
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="section-title">My discussions</h2>
        <ul className="space-y-2">
          {myDiscussions.length === 0 && (
            <li className="text-sm text-[var(--muted)]">You haven’t started a discussion yet.</li>
          )}
          {myDiscussions.map((d) => (
            <li key={d.id}>
              <Link href={`/discussions/${d.id}`} className="font-medium text-[var(--navy)] hover:underline">
                {d.title}
              </Link>
              <span className="ml-2 text-xs text-[var(--muted)]">{formatDate(d.date)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="section-title">Following</h2>
        <ul className="space-y-2">
          {following.length === 0 && (
            <li className="text-sm text-[var(--muted)]">You’re not following any discussions.</li>
          )}
          {following.map((d) => (
            <li key={d.id}>
              <Link href={`/discussions/${d.id}`} className="font-medium text-[var(--navy)] hover:underline">
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="section-title">My submissions</h2>
        <ul className="space-y-3">
          {mySubmissions.length === 0 && (
            <li className="text-sm text-[var(--muted)]">No submissions yet.</li>
          )}
          {mySubmissions.map((s) => (
            <li key={s.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{s.type}</span>
                <span
                  className={`badge ${
                    s.status === "approved"
                      ? "badge-green"
                      : s.status === "pending"
                        ? "badge-amber"
                        : "badge-blue"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="mt-1 font-semibold text-[var(--navy)]">{s.title}</div>
              <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{s.content}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="section-title">Notification preferences</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          These control which in-app notifications you receive in this demo.
        </p>
        <div className="space-y-3">
          {(
            [
              ["importantAnnouncements", "Important announcements"],
              ["news", "News"],
              ["events", "Events"],
              ["discussionsIFollow", "Discussions I follow"],
              ["commentsOnMyPosts", "Comments on my posts"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-3">
              <span className="text-sm font-medium">{label}</span>
              <input
                type="checkbox"
                checked={prefState[key]}
                onChange={() => togglePref(key)}
                className="h-4 w-4"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
