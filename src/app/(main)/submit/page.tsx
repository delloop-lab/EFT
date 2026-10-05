"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDataStore } from "@/lib/data-store";
import type { SubmissionType } from "@/lib/types";

export default function SubmitPage() {
  const router = useRouter();
  const { categories, createSubmission } = useDataStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<SubmissionType>("discussion");
  const [categoryId, setCategoryId] = useState("cat-disc-general");
  const [submitted, setSubmitted] = useState(false);

  const availableCategories = categories.filter((c) =>
    type === "news" ? c.type === "news" || c.type === "both" : c.type === "discussion" || c.type === "both"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createSubmission({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      type,
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl card p-8 text-center animate-fade-up">
        <span className="badge badge-amber">Pending moderation</span>
        <h1 className="mt-4 text-3xl font-semibold">Thank you</h1>
        <p className="mt-3 text-[var(--muted)]">
          Your submission has been received and is waiting for a moderator to review.
          It will not appear as published content until it is approved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account" className="btn-primary">
            View my submissions
          </Link>
          <button type="button" className="btn-secondary" onClick={() => router.push("/")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <h1 className="text-3xl font-semibold">Have something to share?</h1>
      <p className="mt-2 text-[var(--muted)]">
        Submit an idea for a discussion or news item. A moderator will review it before it is published.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="sub-title">Title</label>
          <input
            id="sub-title"
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Could we organise a members' walking group?"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="sub-type">Type</label>
          <select
            id="sub-type"
            className="field"
            value={type}
            onChange={(e) => {
              const next = e.target.value as SubmissionType;
              setType(next);
              setCategoryId(next === "news" ? "cat-news-community" : "cat-disc-general");
            }}
          >
            <option value="discussion">Discussion</option>
            <option value="news">News</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sub-cat">Category</label>
          <select
            id="sub-cat"
            className="field"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sub-content">Content</label>
          <textarea
            id="sub-content"
            className="field min-h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Explain what you'd like to share…"
            required
          />
        </div>
        <button type="submit" className="btn-primary">Submit for moderation</button>
      </form>
    </div>
  );
}
