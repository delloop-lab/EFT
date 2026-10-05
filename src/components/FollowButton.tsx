"use client";

import { useDataStore } from "@/lib/data-store";

export function FollowButton({ discussionId }: { discussionId: string }) {
  const { currentUser, getDiscussion, followDiscussion, unfollowDiscussion } = useDataStore();
  const discussion = getDiscussion(discussionId);
  if (!discussion || !currentUser) return null;

  const following = discussion.followers.includes(currentUser.id);

  return (
    <button
      type="button"
      onClick={() =>
        following ? unfollowDiscussion(discussionId) : followDiscussion(discussionId)
      }
      className={
        following
          ? "rounded-md border border-[var(--navy)] bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--navy-soft)]"
          : "rounded-md border border-[var(--navy)] bg-white px-4 py-2 text-sm font-medium text-[var(--navy)] transition hover:bg-[var(--surface-muted)]"
      }
    >
      {following ? "Following" : "Follow discussion"}
    </button>
  );
}
