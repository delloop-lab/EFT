"use client";

import Link from "next/link";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/format";

export default function DiscussionsPage() {
  const { getDiscussions, getComments, getMember, categories, currentUser } = useDataStore();
  const discussions = getDiscussions();

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Discussions</h1>
          <p className="mt-2 max-w-2xl text-[var(--muted)]">
            Ask questions and share ideas with members who choose to follow the conversation.
            There is no “reply all”.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/submit" className="btn-secondary">
            Submit for moderation
          </Link>
          <Link href="/discussions/new" className="btn-primary">
            Start a discussion
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {discussions.map((disc) => {
          const author = getMember(disc.authorId);
          const category = categories.find((c) => c.id === disc.categoryId);
          const count = getComments(disc.id).length;
          const following = currentUser ? disc.followers.includes(currentUser.id) : false;
          return (
            <Link
              key={disc.id}
              href={`/discussions/${disc.id}`}
              className="card block p-5 transition hover:border-[var(--blue)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{category?.name ?? "General"}</span>
                {following && <span className="badge badge-green">Following</span>}
                <span className="text-xs text-[var(--muted)]">Updated {formatDate(disc.updatedAt)}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[var(--navy)]">{disc.title}</h2>
              <p className="mt-2 line-clamp-2 text-[var(--muted)]">{disc.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span>By {author?.name ?? "Unknown"}</span>
                <span>·</span>
                <span>
                  {count} comment{count === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
