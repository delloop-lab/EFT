"use client";

import Link from "next/link";
import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/format";

export default function NewsPage() {
  const { getPosts, getMember, categories, canPublishNews, createPost, currentUser } =
    useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("cat-news-announcements");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("published");

  const posts = getPosts().filter((p) =>
    canPublishNews ? true : p.status === "published"
  );
  const newsCategories = categories.filter((c) => c.type === "news" || c.type === "both");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const post = createPost({
      title: title.trim(),
      summary: summary.trim() || body.trim().slice(0, 160),
      body: body.trim(),
      categoryId,
      status,
      isAnnouncement,
    });
    setTitle("");
    setSummary("");
    setBody("");
    setShowForm(false);
    window.location.href = `/news/${post.id}`;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">News</h1>
          <p className="mt-2 text-[var(--muted)]">
            Official association information — announcements, committee updates and community news.
          </p>
        </div>
        {canPublishNews && (
          <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Create news"}
          </button>
        )}
      </div>

      {showForm && canPublishNews && (
        <form onSubmit={handleCreate} className="card space-y-4 p-5">
          <h2 className="text-lg font-semibold text-[var(--navy)]">New news post</h2>
          <div>
            <label className="label" htmlFor="news-title">Title</label>
            <input id="news-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="news-summary">Summary</label>
            <input id="news-summary" className="field" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="news-body">Body</label>
            <textarea id="news-body" className="field min-h-36" value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="news-cat">Category</label>
              <select id="news-cat" className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {newsCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="news-status">Status</label>
              <select id="news-status" className="field" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isAnnouncement} onChange={(e) => setIsAnnouncement(e.target.checked)} />
              Important announcement
            </label>
          </div>
          <button type="submit" className="btn-primary">Save news</button>
          <p className="text-xs text-[var(--muted)]">Publishing as {currentUser?.name}</p>
        </form>
      )}

      <div className="space-y-3">
        {posts.map((post) => {
          const author = getMember(post.authorId);
          const category = categories.find((c) => c.id === post.categoryId);
          return (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="card block p-5 transition hover:border-[var(--blue)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                {post.isAnnouncement && <span className="badge badge-amber">Announcement</span>}
                <span className="badge">{category?.name ?? "News"}</span>
                {post.status !== "published" && (
                  <span className="badge badge-blue">{post.status}</span>
                )}
                <span className="text-xs text-[var(--muted)]">{formatDate(post.date)}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[var(--navy)]">{post.title}</h2>
              <p className="mt-2 text-[var(--muted)]">{post.summary}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">By {author?.name ?? "Unknown"}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
