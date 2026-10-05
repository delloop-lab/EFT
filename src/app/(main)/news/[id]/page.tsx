"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/format";

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const { getPost, getMember, categories, canPublishNews, updatePost } = useDataStore();
  const post = getPost(params.id);

  if (!post) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">News not found</h1>
        <Link href="/news" className="mt-4 inline-block text-[var(--blue)]">
          Back to news
        </Link>
      </div>
    );
  }

  const author = getMember(post.authorId);
  const category = categories.find((c) => c.id === post.categoryId);

  return (
    <article className="mx-auto max-w-3xl animate-fade-up">
      <Link href="/news" className="text-sm font-medium text-[var(--blue)]">
        ← Back to news
      </Link>
      <div className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {post.isAnnouncement && <span className="badge badge-amber">Announcement</span>}
          <span className="badge">{category?.name ?? "News"}</span>
          <span className="badge">{post.status}</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{post.title}</h1>
        <p className="mt-3 text-[var(--muted)]">
          {author?.name ?? "Unknown"} · {formatDate(post.date)}
        </p>
        <p className="mt-4 text-lg text-[var(--text)]">{post.summary}</p>
        <div className="prose-body mt-6 border-t border-[var(--border)] pt-6">{post.body}</div>

        {canPublishNews && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
            {post.status !== "published" && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => updatePost(post.id, { status: "published" })}
              >
                Publish
              </button>
            )}
            {post.status === "published" && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => updatePost(post.id, { status: "archived" })}
              >
                Archive
              </button>
            )}
            {post.status === "archived" && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => updatePost(post.id, { status: "published" })}
              >
                Restore
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
