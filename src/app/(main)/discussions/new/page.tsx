"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDataStore } from "@/lib/data-store";

export default function NewDiscussionPage() {
  const router = useRouter();
  const { categories, createDiscussion } = useDataStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("cat-disc-general");

  const discussionCategories = categories.filter(
    (c) => c.type === "discussion" || c.type === "both"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const disc = createDiscussion({
      title: title.trim(),
      body: body.trim(),
      categoryId,
    });
    router.push(`/discussions/${disc.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link href="/discussions" className="text-sm font-medium text-[var(--blue)]">
        ← Back to discussions
      </Link>
      <div className="card mt-4 p-6">
        <h1 className="text-3xl font-semibold">Start a discussion</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your discussion appears immediately. Members who follow it will receive in-app notifications about new comments — not the whole association.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input
              id="title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to discuss?"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select
              id="category"
              className="field"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {discussionCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="body">Details</label>
            <textarea
              id="body"
              className="field min-h-40"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share a little context so others can respond helpfully."
              required
            />
          </div>
          <button type="submit" className="btn-primary">Publish discussion</button>
        </form>
      </div>
    </div>
  );
}
