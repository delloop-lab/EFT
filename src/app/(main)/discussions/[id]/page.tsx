"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { FollowButton } from "@/components/FollowButton";
import { useDataStore } from "@/lib/data-store";
import { formatDateTime } from "@/lib/format";

export default function DiscussionDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    currentUser,
    getDiscussion,
    getComments,
    getMember,
    categories,
    createComment,
    updateComment,
    deleteComment,
  } = useDataStore();

  const discussion = getDiscussion(params.id);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  if (!discussion || !currentUser) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Discussion not found</h1>
        <Link href="/discussions" className="mt-4 inline-block text-[var(--blue)]">
          Back to discussions
        </Link>
      </div>
    );
  }

  const author = getMember(discussion.authorId);
  const category = categories.find((c) => c.id === discussion.categoryId);
  const comments = getComments(discussion.id);
  const following = discussion.followers.includes(currentUser.id);

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    createComment(discussion!.id, body.trim());
    setBody("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <Link href="/discussions" className="text-sm font-medium text-[var(--blue)]">
        ← Back to discussions
      </Link>

      <article className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">{category?.name ?? "General"}</span>
            {following && <span className="badge badge-green">Following</span>}
          </div>
          <FollowButton discussionId={discussion.id} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{discussion.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          {author && <Avatar member={author} size="sm" />}
          <div className="text-sm text-[var(--muted)]">
            <Link href={`/members/${discussion.authorId}`} className="font-medium text-[var(--navy)] hover:underline">
              {author?.name ?? "Unknown"}
            </Link>
            <span> · {formatDateTime(discussion.date)}</span>
          </div>
        </div>
        <div className="prose-body mt-6">{discussion.body}</div>
        <p className="mt-6 rounded-md bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)]">
          Follow this discussion to receive in-app notifications when someone comments.
          Members who are not following will not be notified.
        </p>
      </article>

      <section className="card p-6">
        <h2 className="section-title">
          Comments ({comments.length})
        </h2>
        <ul className="space-y-4">
          {comments.map((comment) => {
            const commentAuthor = getMember(comment.authorId);
            const isOwn = comment.authorId === currentUser.id;
            const isEditing = editingId === comment.id;
            return (
              <li key={comment.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex items-start gap-3">
                  {commentAuthor && <Avatar member={commentAuthor} size="sm" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Link
                        href={`/members/${comment.authorId}`}
                        className="font-semibold text-[var(--navy)] hover:underline"
                      >
                        {commentAuthor?.name ?? "Unknown"}
                      </Link>
                      <span className="text-[var(--muted)]">{formatDateTime(comment.date)}</span>
                      {comment.editedAt && (
                        <span className="text-xs text-[var(--muted)]">(edited)</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="field min-h-24"
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => {
                              if (!editBody.trim()) return;
                              updateComment(comment.id, editBody.trim());
                              setEditingId(null);
                            }}
                          >
                            Save
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
                    ) : (
                      <p className="prose-body mt-2">{comment.body}</p>
                    )}
                    {isOwn && !isEditing && (
                      <div className="mt-3 flex gap-3 text-sm">
                        <button
                          type="button"
                          className="font-medium text-[var(--blue)]"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditBody(comment.body);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="font-medium text-red-700"
                          onClick={() => {
                            if (confirm("Delete this comment?")) deleteComment(comment.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          {comments.length === 0 && (
            <li className="text-sm text-[var(--muted)]">No comments yet. Be the first to reply.</li>
          )}
        </ul>

        <form onSubmit={handleComment} className="mt-6 border-t border-[var(--border)] pt-5">
          <label className="label" htmlFor="comment">Add a comment</label>
          <textarea
            id="comment"
            className="field min-h-28"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share a helpful reply…"
            required
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              Only followers of this discussion receive a notification.
            </p>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </section>
    </div>
  );
}
