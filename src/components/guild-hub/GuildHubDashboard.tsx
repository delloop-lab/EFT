"use client";

import {
  AtSign,
  Ban,
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flag,
  Globe2,
  Headphones,
  Link2,
  Lock,
  MessageSquare,
  Pin,
  Repeat2,
  Reply,
  Settings2,
  Shield,
  SmilePlus,
  Star,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ADMIN_USER,
  DEMO_ACCOUNTS,
  INITIAL_FAVOURITES,
  INITIAL_LOCAL_ACCOUNTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REBLOGS,
  INITIAL_REPORTS,
  INITIAL_STATUSES,
  INSTANCE,
  MEMBER_USER,
  REACTION_PICKER,
  USERS,
  formatRelativeTime,
  roleLabel,
  type FeedTab,
  type HubNotification,
  type HubUser,
  type LocalAccount,
  type LocalUserState,
  type ModerationReport,
  type NotificationKind,
  type Privacy,
  type Status,
} from "@/lib/guild-hub/mockData";
import {
  extractFirstHttpUrl,
  fetchLinkPreview,
  hostnameOf,
  stripUrlFromText,
  type LinkPreview,
} from "@/lib/guild-hub/linkPreview";
import "./guild-hub.css";

function toggleIdInMap(
  map: Record<string, string[]>,
  userId: string,
  statusId: string,
): { next: Record<string, string[]>; added: boolean } {
  const current = new Set(map[userId] ?? []);
  const added = !current.has(statusId);
  if (added) current.add(statusId);
  else current.delete(statusId);
  return { next: { ...map, [userId]: [...current] }, added };
}

function renderContent(text: string) {
  const parts = text.split(/(\n|#[\w]+|@[\w.-]+)/g);
  return parts.map((part, i) => {
    if (part === "\n") return <br key={i} />;
    if (part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={i} className="hub-mention">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Avatar({
  src,
  size = 48,
  className = "",
  name = "?",
  onClick,
}: {
  src: string;
  size?: number;
  className?: string;
  name?: string;
  onClick?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const inner = failed ? (
    <span
      className={`hub-avatar inline-flex items-center justify-center bg-[#cbd5e1] text-[var(--hub-navy)] font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`hub-avatar ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );

  if (!onClick) return inner;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`View ${name}`}
      aria-label={`View ${name}'s profile`}
      className="rounded-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hub-accent)]"
    >
      {inner}
    </button>
  );
}

export function GuildHubDashboard() {
  const [currentUserId, setCurrentUserId] = useState(MEMBER_USER.id);
  const [statuses, setStatuses] = useState<Status[]>(INITIAL_STATUSES);
  const [favourites, setFavourites] = useState(INITIAL_FAVOURITES);
  const [reblogs, setReblogs] = useState(INITIAL_REBLOGS);
  const [reports, setReports] = useState<ModerationReport[]>(INITIAL_REPORTS);
  const [accounts, setAccounts] = useState<LocalAccount[]>(INITIAL_LOCAL_ACCOUNTS);
  const [tab, setTab] = useState<FeedTab>("timeline");
  const [subject, setSubject] = useState("");
  const [draft, setDraft] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [dmTargetId, setDmTargetId] = useState("u-joao");
  const [metrics, setMetrics] = useState(INSTANCE);
  const [toast, setToast] = useState<string | null>(null);
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] =
    useState<HubNotification[]>(INITIAL_NOTIFICATIONS);
  const [highlightStatusId, setHighlightStatusId] = useState<string | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [draftLinkPreview, setDraftLinkPreview] = useState<LinkPreview | null>(null);
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
  const lockedPreviewUrlRef = useRef<string | null>(null);

  const currentUser = USERS[currentUserId] ?? MEMBER_USER;
  const isAdmin = currentUser.role === "admin";
  const maxChars = metrics.maxStatusChars;
  const openReports = reports.filter((r) => r.state === "open").length;

  const trendingTags = useMemo(() => {
    const counts = new Map<string, { tag: string; count: number }>();
    for (const status of statuses) {
      if (status.deleted || status.isDm || status.inReplyToId) continue;
      const tags = status.content.match(/#[\w]+/g) ?? [];
      for (const tag of tags) {
        const key = tag.toLowerCase();
        const existing = counts.get(key);
        if (existing) existing.count += 1;
        else counts.set(key, { tag, count: 1 });
      }
    }
    const ranked = [...counts.values()].sort(
      (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
    );
    if (ranked.length === 0) {
      return {
        value: "—",
        hint: "No tags in the feed yet",
        tooltip: "No trending tags yet",
      };
    }
    const top = ranked.slice(0, 2).map((entry) => entry.tag);
    const tooltip = ranked
      .slice(0, 8)
      .map((entry) => `${entry.tag} (${entry.count})`)
      .join("\n");
    return {
      value: top.join(" · "),
      hint: "Hover for all top tags",
      tooltip: `Trending tags\n${tooltip}`,
    };
  }, [statuses]);

  const unansweredRate = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const eligible = statuses.filter(
      (s) =>
        !s.deleted &&
        !s.isDm &&
        !s.inReplyToId &&
        s.privacy !== "direct" &&
        now - new Date(s.createdAt).getTime() >= twentyFourHours,
    );
    const quiet = eligible.filter((s) => {
      const reactionTotal = (s.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
      return s.replyCount === 0 && reactionTotal === 0;
    });
    const percent =
      eligible.length === 0 ? 0 : Math.round((quiet.length / eligible.length) * 100);
    return { percent, count: quiet.length };
  }, [statuses]);

  const myNotifications = useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === currentUserId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications, currentUserId],
  );
  const unreadCount = useMemo(
    () => myNotifications.filter((n) => !n.read).length,
    [myNotifications],
  );
  const myFavourites = useMemo(
    () => new Set(favourites[currentUserId] ?? []),
    [favourites, currentUserId],
  );
  const myReblogs = useMemo(
    () => new Set(reblogs[currentUserId] ?? []),
    [reblogs, currentUserId],
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const suspendedIds = useMemo(
    () => new Set(accounts.filter((a) => a.state === "suspended").map((a) => a.userId)),
    [accounts],
  );

  const filtered = useMemo(() => {
    const visible = statuses.filter((s) => !s.deleted && !suspendedIds.has(s.authorId));
    if (tab === "moderation" || tab === "about" || tab === "interactions") return [];
    if (tab === "timeline") {
      return visible
        .filter((s) => !s.isDm && s.privacy !== "direct" && !s.inReplyToId)
        .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
    }
    return visible.filter(
      (s) =>
        (Boolean(s.isDm) || s.privacy === "direct") &&
        (s.dmParticipants?.includes(currentUserId) || s.authorId === currentUserId),
    );
  }, [statuses, tab, currentUserId, suspendedIds]);

  const repliesByParent = useMemo(() => {
    const map: Record<string, Status[]> = {};
    for (const s of statuses) {
      if (s.deleted || s.inReplyToId == null || suspendedIds.has(s.authorId)) continue;
      (map[s.inReplyToId] ??= []).push(s);
    }
    for (const id of Object.keys(map)) {
      map[id].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    return map;
  }, [statuses, suspendedIds]);

  function toggleThread(statusId: string) {
    setExpandedThreads((prev) => ({ ...prev, [statusId]: !prev[statusId] }));
  }

  function pushActivity(input: {
    recipientId: string;
    actorId: string;
    kind: NotificationKind;
    preview: string;
    statusId?: string;
  }) {
    if (input.recipientId === input.actorId) return;
    setNotifications((prev) => [
      {
        id: `n-live-${Date.now()}`,
        recipientId: input.recipientId,
        actorId: input.actorId,
        kind: input.kind,
        createdAt: new Date().toISOString(),
        preview: input.preview,
        statusId: input.statusId,
        read: false,
      },
      ...prev,
    ]);
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function markAllNotificationsRead() {
    setNotifications((prev) =>
      prev.map((n) =>
        n.recipientId === currentUserId ? { ...n, read: true } : n,
      ),
    );
    showToast("Notifications marked as read");
  }

  function openNotification(n: HubNotification) {
    markNotificationRead(n.id);
    if (!n.statusId) return;
    const target = statuses.find((s) => s.id === n.statusId);
    const parentId = target?.inReplyToId ?? n.statusId;
    setTab("timeline");
    setExpandedThreads((prev) => ({ ...prev, [parentId]: true }));
    setHighlightStatusId(parentId);
    window.setTimeout(() => {
      document.getElementById(`hub-status-${parentId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
    window.setTimeout(() => setHighlightStatusId(null), 2200);
  }

  function openProfile(userId: string) {
    if (!USERS[userId]) return;
    setProfileUserId(userId);
  }

  function closeProfile() {
    setProfileUserId(null);
  }

  function messageUser(userId: string) {
    if (userId === currentUserId) return;
    setProfileUserId(null);
    setReplyToId(null);
    setDmTargetId(userId);
    setPrivacy("direct");
    setSubject("");
    setDraft("");
    setComposeOpen(true);
    setTab("direct");
  }

  function openProfilePost(statusId: string) {
    setProfileUserId(null);
    setTab("timeline");
    setExpandedThreads((prev) => ({ ...prev, [statusId]: true }));
    setHighlightStatusId(statusId);
    window.setTimeout(() => {
      document.getElementById(`hub-status-${statusId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
    window.setTimeout(() => setHighlightStatusId(null), 2200);
  }

  const profileUser = profileUserId ? USERS[profileUserId] : null;
  const profilePosts = useMemo(() => {
    if (!profileUserId) return [];
    return statuses
      .filter(
        (s) =>
          s.authorId === profileUserId &&
          !s.deleted &&
          !s.isDm &&
          s.privacy !== "direct" &&
          !s.inReplyToId,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [profileUserId, statuses]);

  useEffect(() => {
    if (!profileUserId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileUserId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profileUserId]);

  useEffect(() => {
    if (!composeOpen || privacy === "direct") {
      setDraftLinkPreview(null);
      setLinkPreviewLoading(false);
      lockedPreviewUrlRef.current = null;
      return;
    }
    const url = extractFirstHttpUrl(draft);
    if (!url) {
      // Keep the card after the URL is deleted so they can write about the article
      setLinkPreviewLoading(false);
      return;
    }
    if (lockedPreviewUrlRef.current === url) {
      setLinkPreviewLoading(false);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLinkPreviewLoading(true);
      try {
        const preview = await fetchLinkPreview(url);
        if (!cancelled) {
          setDraftLinkPreview(preview);
          lockedPreviewUrlRef.current = preview ? url : null;
        }
      } catch {
        if (!cancelled) {
          setDraftLinkPreview(null);
          lockedPreviewUrlRef.current = null;
        }
      } finally {
        if (!cancelled) setLinkPreviewLoading(false);
      }
    }, 550);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [composeOpen, draft, privacy]);

  function clearDraftLinkPreview() {
    setDraftLinkPreview(null);
    lockedPreviewUrlRef.current = null;
  }

  function removeLinkFromDraftKeepPreview() {
    const url = extractFirstHttpUrl(draft) ?? lockedPreviewUrlRef.current;
    setDraft(stripUrlFromText(draft, url));
  }

  function switchAccount(userId: string) {
    setCurrentUserId(userId);
    setReplyToId(null);
    setDraft("");
    setSubject("");
    setPrivacy("public");
    setComposeOpen(false);
    const next = USERS[userId];
    if (next?.role !== "admin" && tab === "moderation") setTab("timeline");
    showToast(`Viewing as ${next?.displayName ?? "user"} (${roleLabel(next?.role ?? "member")})`);
  }

  function toggleFavourite(id: string) {
    const { next, added } = toggleIdInMap(favourites, currentUserId, id);
    setFavourites(next);
    setStatuses((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, favouriteCount: Math.max(0, s.favouriteCount + (added ? 1 : -1)) }
          : s,
      ),
    );
    if (added) {
      const status = statuses.find((s) => s.id === id);
      if (status) {
        pushActivity({
          recipientId: status.authorId,
          actorId: currentUserId,
          kind: "favourite",
          preview: "liked your post",
          statusId: id,
        });
      }
    }
  }

  function toggleReblog(id: string) {
    const { next, added } = toggleIdInMap(reblogs, currentUserId, id);
    setReblogs(next);
    setStatuses((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, reblogCount: Math.max(0, s.reblogCount + (added ? 1 : -1)) }
          : s,
      ),
    );
    if (added) {
      const status = statuses.find((s) => s.id === id);
      if (status) {
        pushActivity({
          recipientId: status.authorId,
          actorId: currentUserId,
          kind: "reblog",
          preview: "reposted your post",
          statusId: id,
        });
      }
    }
  }

  function toggleReaction(statusId: string, emoji: string) {
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.id !== statusId) return s;
        const reactions = [...(s.reactions ?? [])];
        const idx = reactions.findIndex((r) => r.emoji === emoji);
        if (idx === -1) reactions.push({ emoji, count: 1, reacted: true });
        else {
          const r = reactions[idx];
          if (r.reacted) {
            const count = r.count - 1;
            if (count <= 0) reactions.splice(idx, 1);
            else reactions[idx] = { ...r, count, reacted: false };
          } else {
            reactions[idx] = { ...r, count: r.count + 1, reacted: true };
          }
        }
        return { ...s, reactions };
      }),
    );
    setReactionPickerFor(null);
  }

  function openReply(status: Status) {
    const author = USERS[status.authorId] ?? currentUser;
    setReplyToId(status.id);
    setPrivacy("public");
    setDraft(`${author.handle} `);
    setSubject("");
    setComposeOpen(true);
  }

  function deleteStatus(id: string) {
    const status = statuses.find((s) => s.id === id);
    if (!status) return;
    if (!(isAdmin || status.authorId === currentUserId)) return;
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, deleted: true };
        if (status.inReplyToId && s.id === status.inReplyToId) {
          return { ...s, replyCount: Math.max(0, s.replyCount - 1) };
        }
        return s;
      }),
    );
    if (!status.isDm && !status.inReplyToId) {
      setMetrics((m) => ({ ...m, localPosts: Math.max(0, m.localPosts - 1) }));
    }
    showToast("Post removed");
  }

  function togglePin(id: string) {
    if (!isAdmin) return;
    setStatuses((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, pinned: !s.pinned };
        if (!s.pinned) return s;
        return { ...s, pinned: false };
      }),
    );
    showToast("Pin updated");
  }

  function reportStatus(status: Status) {
    if (status.authorId === currentUserId) {
      showToast("You can't report your own post");
      return;
    }
    setReports((prev) => [
      {
        id: `r-${Date.now()}`,
        statusId: status.id,
        reporterId: currentUserId,
        reason: "Flagged by member for moderator review",
        createdAt: new Date().toISOString(),
        state: "open",
      },
      ...prev,
    ]);
    showToast("Report submitted to admins");
  }

  async function publish() {
    const content = draft.trim();
    if (!content || content.length > maxChars) return;
    const isDm = privacy === "direct";

    let preview = draftLinkPreview;
    const urlInPost = extractFirstHttpUrl(content);
    if (!isDm && urlInPost && !preview) {
      setLinkPreviewLoading(true);
      try {
        preview = await fetchLinkPreview(urlInPost);
      } catch {
        preview = null;
      } finally {
        setLinkPreviewLoading(false);
      }
    }

    const next: Status = {
      id: `local-${Date.now()}`,
      authorId: currentUserId,
      subject: subject.trim() || undefined,
      content,
      createdAt: new Date().toISOString(),
      privacy,
      replyCount: 0,
      reblogCount: 0,
      favouriteCount: 0,
      isDm,
      dmParticipants: isDm ? [currentUserId, dmTargetId] : undefined,
      inReplyToId: replyToId ?? undefined,
      reactions: [],
      linkPreview: !isDm && preview ? preview : undefined,
    };

    if (replyToId) {
      const parent = statuses.find((s) => s.id === replyToId);
      setStatuses((prev) => [
        next,
        ...prev.map((s) =>
          s.id === replyToId ? { ...s, replyCount: s.replyCount + 1 } : s,
        ),
      ]);
      setExpandedThreads((prev) => ({ ...prev, [replyToId]: true }));
      if (parent) {
        pushActivity({
          recipientId: parent.authorId,
          actorId: currentUserId,
          kind: "reply",
          preview: "replied to your post",
          statusId: replyToId,
        });
      }
    } else {
      setStatuses((prev) => [next, ...prev]);
    }

    if (!isDm) setMetrics((m) => ({ ...m, localPosts: m.localPosts + 1 }));
    setDraft("");
    setSubject("");
    setReplyToId(null);
    clearDraftLinkPreview();
    setComposeOpen(false);
    setTab(isDm ? "direct" : "timeline");
    showToast(
      isDm
        ? "Message sent"
        : preview?.imageUrl
          ? "Posted with story image"
          : "Posted to Guild Feed",
    );
  }

  const dmTargets = Object.values(USERS).filter((u) => u.id !== currentUserId);

  const tabs: { key: FeedTab; label: string }[] = [
    { key: "timeline", label: "Guild Feed" },
    {
      key: "interactions",
      label: unreadCount > 0 ? `Notifications (${unreadCount})` : "Notifications",
    },
    { key: "direct", label: "Direct Messages" },
    ...(isAdmin
      ? [{ key: "moderation" as const, label: `Moderation${openReports ? ` (${openReports})` : ""}` }]
      : []),
  ];

  return (
    <div className="guild-hub-shell">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Top bar: brand + role switch */}
        <header className="hub-panel mb-5 overflow-visible">
          <div className="hub-header-banner overflow-hidden border-b border-[var(--hub-line)] text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/guild-banner.png"
              alt=""
              className="hub-header-banner__image"
            />
            <div className="hub-header-banner__shade" aria-hidden />
            <div className="hub-header-banner__content flex flex-col gap-4 px-4 pb-4 pt-10 sm:flex-row sm:items-end sm:justify-between sm:px-5 sm:pb-5 sm:pt-14">
              <div className="flex items-end gap-3 sm:gap-4">
                  <Image
                    src="/logo-guild.png"
                    alt="The EFT Guild"
                    width={96}
                    height={96}
                    className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-md sm:h-24 sm:w-24"
                    priority
                  />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    EFT Guild Hub
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-200">
                    A private members space for discussions and interaction
                  </p>
                </div>
              </div>
              <div
                role="tablist"
                aria-label="Demo guides"
                className="flex flex-wrap gap-1.5 self-start sm:self-end"
              >
                <span
                  role="tab"
                  aria-selected="true"
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--hub-navy)]"
                >
                  Demo walkthrough
                </span>
                <Link
                  href="/new/features"
                  role="tab"
                  aria-selected="false"
                  className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/25"
                >
                  Features &amp; Benefits
                </Link>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2 px-4 py-2.5 sm:px-5 lg:flex-nowrap">
              <Metric label="Members" value={String(metrics.memberCount)} hint="Guild accounts" />
              <Metric label="Active" value={String(metrics.activeUsers)} hint="Last 30 days" />
              <Metric label="Posts" value={String(metrics.localPosts)} hint="Member updates" />
              <Metric
                label="Reports"
                value={String(openReports)}
                hint="Open · tap to review"
                onClick={() => setTab("moderation")}
              />
              <Metric
                label="Peak windows"
                value="Tue · Thu"
                hint="19:00–21:00 UK"
                tooltip={"Peak engagement\nTuesday & Thursday\n19:00–21:00 UK time\nBest for live events & announcements"}
              />
              <Metric
                label="Trending"
                value={trendingTags.value}
                hint={trendingTags.hint}
                tooltip={trendingTags.tooltip}
              />
              <Metric
                label="Unanswered"
                value={`${unansweredRate.percent}%`}
                hint={`${unansweredRate.count} quiet after 24h`}
                tooltip={`Unanswered posts\n${unansweredRate.count} post${unansweredRate.count === 1 ? "" : "s"} with no replies or reactions after 24 hours (${unansweredRate.percent}%)\nWorth a community reach-out`}
              />
            </div>
          )}
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            {/* Compose trigger */}
            <section className="hub-panel p-4">
              <div className="flex items-center gap-3">
                <Avatar src={currentUser.avatarUrl} size={44} name={currentUser.displayName} />
                <button
                  type="button"
                  onClick={() => setComposeOpen(true)}
                  className="flex-1 rounded-xl border border-[var(--hub-line)] bg-[#f8fafc] px-4 py-2.5 text-left text-sm text-[var(--hub-muted)] transition hover:border-[var(--hub-accent)] hover:bg-[var(--hub-accent-soft)]"
                >
                  Share a training note or practice invite…
                </button>
                <button
                  type="button"
                  onClick={() => setComposeOpen(true)}
                  className="hidden rounded-lg bg-[var(--hub-navy)] px-3.5 py-2.5 text-sm font-semibold text-white sm:inline-flex"
                >
                  Compose
                </button>
              </div>
              {isAdmin && (
                <p className="mt-2 text-xs text-[var(--hub-muted)]">
                  Signed in as admin — you can pin posts, moderate reports, and manage members.
                </p>
              )}
            </section>

            <div className="hub-panel flex gap-1 p-1">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`hub-tab ${tab === key ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "moderation" && isAdmin ? (
              <ModerationPanel
                reports={reports}
                accounts={accounts}
                statuses={statuses}
                registrationsOpen={metrics.registrationsOpen}
                onResolve={(id) => {
                  setReports((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, state: "resolved" } : r)),
                  );
                  showToast("Report resolved");
                }}
                onDeleteStatus={deleteStatus}
                onOpenPost={openProfilePost}
                onSetAccountState={(userId, state) => {
                  if (userId === ADMIN_USER.id) return;
                  setAccounts((prev) =>
                    prev.map((a) => (a.userId === userId ? { ...a, state } : a)),
                  );
                  showToast(
                    state === "active"
                      ? "Account restored"
                      : state === "muted"
                        ? "Account muted"
                        : "Account suspended",
                  );
                }}
                onToggleRegistrations={() => {
                  setMetrics((m) => ({ ...m, registrationsOpen: !m.registrationsOpen }));
                  showToast(
                    metrics.registrationsOpen
                      ? "Member invites set to invite-only"
                      : "Member invites opened",
                  );
                }}
              />
            ) : tab === "interactions" ? (
              <NotificationsPanel
                items={myNotifications}
                unreadCount={unreadCount}
                onOpen={openNotification}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                onOpenProfile={openProfile}
              />
            ) : (
              <div className="hub-panel divide-y divide-[var(--hub-line)] overflow-hidden">
                {filtered.length === 0 && (
                  <p className="px-5 py-12 text-center text-sm text-[var(--hub-muted)]">
                    No posts in this view yet.
                  </p>
                )}
                {filtered.map((status) => {
                  const author = USERS[status.authorId] ?? currentUser;
                  const favourited = myFavourites.has(status.id);
                  const reblogged = myReblogs.has(status.id);
                  const canDelete = isAdmin || status.authorId === currentUserId;
                  const threadReplies = repliesByParent[status.id] ?? [];
                  const replyTotal = Math.max(status.replyCount, threadReplies.length);
                  const threadOpen = Boolean(expandedThreads[status.id]);
                  const highlighted = highlightStatusId === status.id;
                  return (
                    <article
                      key={status.id}
                      id={`hub-status-${status.id}`}
                      className={`px-4 py-4 sm:px-5 transition ${
                        highlighted ? "bg-[var(--hub-accent-soft)]" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <Avatar
                          src={author.avatarUrl}
                          size={48}
                          name={author.displayName}
                          onClick={() => openProfile(author.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <button
                              type="button"
                              onClick={() => openProfile(author.id)}
                              className="font-semibold text-[var(--hub-navy)] hover:underline"
                            >
                              {author.displayName}
                            </button>
                            {author.role === "admin" && (
                              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
                                Admin
                              </span>
                            )}
                            <span className="text-sm text-[var(--hub-muted)]">{author.handle}</span>
                            <span className="ml-auto text-xs text-[var(--hub-muted)]">
                              {formatRelativeTime(status.createdAt)}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--hub-muted)]">
                            {status.pinned && (
                              <span className="inline-flex items-center gap-1 text-[var(--hub-accent)]">
                                <Pin className="h-3 w-3" /> Pinned
                              </span>
                            )}
                            {status.privacy !== "public" && (
                              <span className="inline-flex items-center gap-1">
                                <Lock className="h-3 w-3" /> {status.privacy}
                              </span>
                            )}
                            {status.subject && (
                              <span className="normal-case tracking-normal text-[var(--hub-navy)]">
                                {status.subject}
                              </span>
                            )}
                          </div>

                          <div className="mt-2 text-[15px] leading-relaxed text-[var(--hub-ink)]">
                            {renderContent(status.content)}
                          </div>

                          {status.imageUrl && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--hub-line)] bg-[#eef2f6]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={status.imageUrl}
                                alt={status.imageAlt ?? ""}
                                className="max-h-72 w-full object-cover"
                              />
                            </div>
                          )}

                          {status.youtubeId && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--hub-line)] bg-black aspect-video">
                              <iframe
                                src={`https://www.youtube.com/embed/${status.youtubeId}`}
                                title={status.subject ?? "Guild video"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="h-full w-full"
                              />
                            </div>
                          )}

                          {!status.youtubeId && status.videoUrl && (
                            <div className="mt-3 overflow-hidden rounded-xl border border-[var(--hub-line)] bg-black">
                              <video
                                controls
                                preload="metadata"
                                playsInline
                                poster={status.videoPoster}
                                className="max-h-80 w-full bg-black"
                              >
                                <source src={status.videoUrl} type="video/mp4" />
                                Your browser does not support embedded video.
                              </video>
                            </div>
                          )}

                          {status.audioUrl && (
                            <div className="mt-3 rounded-xl border border-[var(--hub-line)] bg-[#f0f5fa] px-3.5 py-3">
                              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--hub-navy)]">
                                <Headphones className="h-4 w-4 text-[var(--hub-accent)]" />
                                {status.audioTitle ?? "Tapping audio"}
                              </div>
                              <audio controls preload="auto" className="w-full">
                                <source src={status.audioUrl} type="audio/mpeg" />
                                Your browser does not support embedded audio.
                              </audio>
                            </div>
                          )}

                          {status.linkPreview && (
                            <LinkPreviewCard preview={status.linkPreview} className="mt-3" />
                          )}

                          {status.reactions && status.reactions.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {status.reactions.map((r) => (
                                <button
                                  key={r.emoji}
                                  type="button"
                                  onClick={() => toggleReaction(status.id, r.emoji)}
                                  className={`hub-reaction ${r.reacted ? "active" : ""}`}
                                >
                                  <span>{r.emoji}</span>
                                  <span className="tabular-nums text-[var(--hub-muted)]">
                                    {r.count}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="relative mt-3 flex flex-wrap items-center gap-0.5 border-t border-[var(--hub-line)] pt-2.5 text-[var(--hub-muted)]">
                            <Action
                              label="Reply"
                              count={replyTotal}
                              onClick={() => openReply(status)}
                              icon={<Reply className="h-4 w-4" />}
                            />
                            <Action
                              label="Repost"
                              count={status.reblogCount}
                              active={reblogged}
                              activeClass="text-emerald-600"
                              onClick={() => toggleReblog(status.id)}
                              icon={<Repeat2 className="h-4 w-4" />}
                            />
                            <Action
                              label="Like"
                              count={status.favouriteCount}
                              active={favourited}
                              activeClass="text-amber-500"
                              onClick={() => toggleFavourite(status.id)}
                              icon={
                                <Star className={`h-4 w-4 ${favourited ? "fill-current" : ""}`} />
                              }
                            />
                            <Action
                              label="React"
                              onClick={() =>
                                setReactionPickerFor(
                                  reactionPickerFor === status.id ? null : status.id,
                                )
                              }
                              icon={<SmilePlus className="h-4 w-4" />}
                            />
                            {!isAdmin && status.authorId !== currentUserId && (
                              <Action
                                label="Report"
                                onClick={() => reportStatus(status)}
                                icon={<Flag className="h-4 w-4" />}
                              />
                            )}
                            {isAdmin && !status.isDm && (
                              <Action
                                label="Pin"
                                active={Boolean(status.pinned)}
                                activeClass="text-[var(--hub-accent)]"
                                onClick={() => togglePin(status.id)}
                                icon={<Pin className="h-4 w-4" />}
                              />
                            )}
                            {canDelete && (
                              <Action
                                label="Delete"
                                onClick={() => deleteStatus(status.id)}
                                icon={<Trash2 className="h-4 w-4" />}
                              />
                            )}

                            {reactionPickerFor === status.id && (
                              <div className="absolute bottom-full left-24 z-10 mb-1 flex gap-1 rounded-lg border border-[var(--hub-line)] bg-white p-1.5 shadow-lg">
                                {REACTION_PICKER.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    className="rounded px-1.5 py-0.5 text-base hover:bg-[var(--hub-accent-soft)]"
                                    onClick={() => toggleReaction(status.id, emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {threadReplies.length > 0 && (
                            <div className="mt-2.5">
                              <button
                                type="button"
                                onClick={() => toggleThread(status.id)}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-[var(--hub-accent)] transition hover:bg-[var(--hub-accent-soft)]"
                              >
                                {threadOpen ? (
                                  <ChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                                {threadOpen
                                  ? "Hide replies"
                                  : `View ${threadReplies.length} ${threadReplies.length === 1 ? "reply" : "replies"}`}
                              </button>

                              {threadOpen && (
                                <div className="hub-thread mt-2 space-y-3 border-l-2 border-[var(--hub-line)] pl-3 sm:pl-4">
                                  {threadReplies.map((reply) => {
                                    const replyAuthor = USERS[reply.authorId] ?? currentUser;
                                    const replyCanDelete =
                                      isAdmin || reply.authorId === currentUserId;
                                    return (
                                      <div key={reply.id} className="flex gap-2.5">
                                        <Avatar
                                          src={replyAuthor.avatarUrl}
                                          size={36}
                                          name={replyAuthor.displayName}
                                          onClick={() => openProfile(replyAuthor.id)}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                            <button
                                              type="button"
                                              onClick={() => openProfile(replyAuthor.id)}
                                              className="text-sm font-semibold text-[var(--hub-navy)] hover:underline"
                                            >
                                              {replyAuthor.displayName}
                                            </button>
                                            <span className="text-xs text-[var(--hub-muted)]">
                                              {replyAuthor.handle}
                                            </span>
                                            <span className="text-xs text-[var(--hub-muted)]">
                                              · {formatRelativeTime(reply.createdAt)}
                                            </span>
                                          </div>
                                          <div className="mt-1 text-sm leading-relaxed text-[var(--hub-ink)]">
                                            {renderContent(reply.content)}
                                          </div>
                                          <div className="mt-1.5 flex flex-wrap items-center gap-0.5 text-[var(--hub-muted)]">
                                            <Action
                                              label="Reply"
                                              onClick={() => openReply(status)}
                                              icon={<Reply className="h-3.5 w-3.5" />}
                                            />
                                            {replyCanDelete && (
                                              <Action
                                                label="Delete"
                                                onClick={() => deleteStatus(reply.id)}
                                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <div className="hub-panel p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
                Signed in as
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  src={currentUser.avatarUrl}
                  size={48}
                  name={currentUser.displayName}
                  onClick={() => openProfile(currentUser.id)}
                />
                <button
                  type="button"
                  onClick={() => openProfile(currentUser.id)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate font-semibold text-[var(--hub-navy)] hover:underline">
                    {currentUser.displayName}
                  </p>
                  <p className="truncate text-xs text-[var(--hub-muted)]">
                    {roleLabel(currentUser.role)} · {currentUser.handle}
                  </p>
                </button>
              </div>
              <div className="hub-role-toggle mt-3 w-full">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => switchAccount(account.id)}
                    className={`flex-1 ${currentUserId === account.id ? "active" : ""}`}
                  >
                    {account.role === "admin" ? (
                      <span className="inline-flex items-center justify-center gap-1">
                        <Shield className="h-3.5 w-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1">
                        <UserRound className="h-3.5 w-3.5" /> Member
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="hub-panel p-4">
              <p className="text-sm font-semibold text-[var(--hub-navy)]">For The EFT Guild</p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--hub-muted)]">
                Members share discussions, practice notes, and peer support in one private space.
                Invite-only — no public networks.
              </p>
              <a
                href="https://eftguild.org/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-xs font-semibold text-[var(--hub-accent)] hover:underline"
              >
                eftguild.org →
              </a>
            </div>

            <div className="hub-panel p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
                Demo walkthrough
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--hub-muted)]">
                Private members conversation space — not the Guild website or PI portal. Try this
                order:
              </p>
              <ol className="mt-3 space-y-2.5 text-xs leading-snug text-[var(--hub-ink)]">
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    1
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Guild Feed</strong> — Claire’s video,
                    Sofia’s <em>audio</em>, Kenji’s <em>news link</em> card, then{" "}
                    <em>View replies</em>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    2
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Profiles</strong> — click a photo or
                    name for bio + recent posts; try <em>Message</em>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    3
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Notifications</strong> — open activity,
                    then <em>Open in feed</em> on an item.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    4
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Interact</strong> — Compose and paste
                    a news URL to pull its image; like/reply; switch Member / Admin.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    5
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Direct Messages</strong> — open the tab
                    or Message from a profile.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--hub-accent-soft)] text-[10px] font-bold text-[var(--hub-accent)]">
                    6
                  </span>
                  <span>
                    <strong className="text-[var(--hub-navy)]">Admin</strong> — switch to Admin for
                    metrics, then <em>Moderation</em> (reports, mute/suspend, invites).
                  </span>
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-2 border-t border-[var(--hub-line)] bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 text-center text-xs text-[var(--hub-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:px-6 lg:px-8">
          <span>Operated by Emotional Health Ltd.</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span>(c) 2014-2026 Emotional Health Ltd.</span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <span>Designed by Trinagra Venture Studio</span>
        </div>
      </footer>

      {profileUser && (
        <ProfileDrawer
          user={profileUser}
          posts={profilePosts}
          isSelf={profileUser.id === currentUserId}
          onClose={closeProfile}
          onMessage={() => messageUser(profileUser.id)}
          onOpenPost={openProfilePost}
        />
      )}

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--hub-navy)]/35 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="hub-panel w-full max-w-lg overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--hub-line)] px-4 py-3">
              <h2 className="text-sm font-semibold text-[var(--hub-navy)]">
                {replyToId ? "Reply" : "Compose"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setComposeOpen(false);
                  setReplyToId(null);
                  clearDraftLinkPreview();
                }}
                className="text-sm font-medium text-[var(--hub-muted)] hover:text-[var(--hub-navy)]"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-xs text-[var(--hub-muted)]">
                <Avatar src={currentUser.avatarUrl} size={28} name={currentUser.displayName} />
                Posting as <strong className="text-[var(--hub-navy)]">{currentUser.handle}</strong>
              </div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject (optional)"
                className="w-full rounded-lg border border-[var(--hub-line)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--hub-accent)]/30"
              />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                autoFocus
                placeholder="Paste a story URL for the image, then remove the link and write your note…"
                className="w-full resize-none rounded-lg border border-[var(--hub-line)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--hub-accent)]/30"
              />
              {privacy !== "direct" && (linkPreviewLoading || draftLinkPreview) && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--hub-muted)]">
                      <Link2 className="h-3.5 w-3.5" />
                      {linkPreviewLoading ? "Fetching story image…" : "Link preview"}
                    </p>
                    {draftLinkPreview && (
                      <div className="flex flex-wrap items-center gap-2">
                        {extractFirstHttpUrl(draft) && (
                          <button
                            type="button"
                            onClick={removeLinkFromDraftKeepPreview}
                            className="text-[11px] font-semibold text-[var(--hub-accent)] hover:underline"
                          >
                            Remove link from text
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={clearDraftLinkPreview}
                          className="text-[11px] font-semibold text-[var(--hub-muted)] hover:text-[var(--hub-navy)]"
                        >
                          Dismiss preview
                        </button>
                      </div>
                    )}
                  </div>
                  {draftLinkPreview && <LinkPreviewCard preview={draftLinkPreview} />}
                  {draftLinkPreview && !extractFirstHttpUrl(draft) && (
                    <p className="text-[11px] text-[var(--hub-muted)]">
                      Link removed from your text — write about the article; the image stays with
                      the post.
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--hub-muted)]">
                  <label className="inline-flex items-center gap-1.5">
                    {privacy === "public" ? (
                      <Globe2 className="h-3.5 w-3.5" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value as Privacy)}
                      className="rounded-md border border-[var(--hub-line)] bg-white px-2 py-1.5 text-sm font-medium text-[var(--hub-ink)]"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="direct">Direct</option>
                    </select>
                  </label>
                  {privacy === "direct" && (
                    <select
                      value={dmTargetId}
                      onChange={(e) => setDmTargetId(e.target.value)}
                      className="rounded-md border border-[var(--hub-line)] bg-white px-2 py-1.5 text-sm font-medium"
                    >
                      {dmTargets.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.displayName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs tabular-nums ${
                      draft.length > maxChars ? "text-rose-600" : "text-[var(--hub-muted)]"
                    }`}
                  >
                    {draft.length}/{maxChars}
                  </span>
                  <button
                    type="button"
                    onClick={() => void publish()}
                    disabled={!draft.trim() || draft.length > maxChars || linkPreviewLoading}
                    className="rounded-lg bg-[var(--hub-navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[var(--hub-line)] bg-white px-4 py-2 text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tooltip,
  onClick,
}: {
  label: string;
  value: string;
  hint: string;
  tooltip?: string;
  onClick?: () => void;
}) {
  const className =
    "group relative min-w-0 flex-1 basis-0 rounded-md bg-[#f8fafc] px-2 py-1.5 ring-1 ring-[var(--hub-line)]";
  const tip = tooltip ?? `${label}\n${value}\n${hint}`;
  const body = (
    <>
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--hub-muted)]">
        {label}
      </p>
      <p className="truncate text-sm font-semibold leading-tight text-[var(--hub-navy)]">{value}</p>
      <p className="truncate text-[10px] leading-tight text-[var(--hub-muted)]">{hint}</p>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 hidden w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-[var(--hub-navy)] px-2.5 py-2 text-left text-[11px] leading-snug font-medium whitespace-pre-line text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {tip}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${className} text-left transition hover:bg-[var(--hub-accent-soft)] hover:ring-[var(--hub-accent)]`}
        title="Open Moderation"
      >
        {body}
      </button>
    );
  }

  return (
    <div className={className} tabIndex={0}>
      {body}
    </div>
  );
}

function notificationKindLabel(kind: NotificationKind) {
  switch (kind) {
    case "favourite":
      return "Liked";
    case "reblog":
      return "Reposted";
    case "reply":
      return "Replied";
    case "mention":
      return "Mentioned";
    case "follow":
      return "Followed";
    default:
      return "Activity";
  }
}

function formatWebsiteLabel(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function LinkPreviewCard({
  preview,
  className = "",
}: {
  preview: LinkPreview;
  className?: string;
}) {
  const site = preview.siteName || hostnameOf(preview.url);
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noreferrer"
      className={`block overflow-hidden rounded-xl border border-[var(--hub-line)] bg-white transition hover:border-[var(--hub-accent)] ${className}`}
    >
      {preview.imageUrl && (
        <div className="relative aspect-[1.91/1] max-h-52 w-full overflow-hidden bg-[#e8eef4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="space-y-1 px-3.5 py-3">
        <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--hub-muted)]">
          <ExternalLink className="h-3 w-3" />
          {site}
        </p>
        {preview.title && (
          <p className="text-sm font-semibold leading-snug text-[var(--hub-navy)]">{preview.title}</p>
        )}
        {preview.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--hub-muted)]">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}

function NotificationKindIcon({ kind }: { kind: NotificationKind }) {
  const className = "h-3.5 w-3.5";
  switch (kind) {
    case "favourite":
      return <Star className={className} />;
    case "reblog":
      return <Repeat2 className={className} />;
    case "reply":
      return <Reply className={className} />;
    case "mention":
      return <AtSign className={className} />;
    case "follow":
      return <UserPlus className={className} />;
    default:
      return <Bell className={className} />;
  }
}

function NotificationsPanel({
  items,
  unreadCount,
  onOpen,
  onMarkRead,
  onMarkAllRead,
  onOpenProfile,
}: {
  items: HubNotification[];
  unreadCount: number;
  onOpen: (n: HubNotification) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenProfile: (userId: string) => void;
}) {
  return (
    <div className="hub-panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hub-line)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[var(--hub-accent)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--hub-navy)]">Activity</p>
            <p className="text-xs text-[var(--hub-muted)]">
              Likes, replies, mentions, and follows in the Hub
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[var(--hub-accent)] transition hover:bg-[var(--hub-accent-soft)]"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-[var(--hub-muted)]">
          No activity yet for this account.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--hub-line)]">
          {items.map((n) => {
            const actor = USERS[n.actorId];
            return (
              <li
                key={n.id}
                className={`flex gap-3 px-4 py-3.5 sm:px-5 ${
                  n.read ? "bg-white" : "bg-[var(--hub-accent-soft)]/60"
                }`}
              >
                <Avatar
                  src={actor?.avatarUrl ?? ""}
                  size={40}
                  name={actor?.displayName ?? "Member"}
                  onClick={() => onOpenProfile(n.actorId)}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="inline-flex items-center gap-1 rounded bg-[#eef2f6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--hub-muted)]">
                      <NotificationKindIcon kind={n.kind} />
                      {notificationKindLabel(n.kind)}
                    </span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--hub-accent)]" aria-label="Unread" />
                    )}
                    <span className="text-xs text-[var(--hub-muted)]">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--hub-ink)]">
                    <button
                      type="button"
                      onClick={() => onOpenProfile(n.actorId)}
                      className="font-semibold text-[var(--hub-navy)] hover:underline"
                    >
                      {actor?.displayName ?? "Member"}
                    </button>{" "}
                    <span className="text-[var(--hub-muted)]">{n.preview}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                    {n.statusId && (
                      <button
                        type="button"
                        onClick={() => onOpen(n)}
                        className="text-[var(--hub-accent)] hover:underline"
                      >
                        Open in feed
                      </button>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(n.id)}
                        className="text-[var(--hub-muted)] hover:text-[var(--hub-navy)]"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ProfileDrawer({
  user,
  posts,
  isSelf,
  onClose,
  onMessage,
  onOpenPost,
}: {
  user: HubUser;
  posts: Status[];
  isSelf: boolean;
  onClose: () => void;
  onMessage: () => void;
  onOpenPost: (statusId: string) => void;
}) {
  return (
    <div className="hub-profile-overlay" role="presentation" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${user.displayName}'s profile`}
        className="hub-profile-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-28 overflow-hidden bg-[#dbe4ee] sm:h-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--hub-navy)] shadow-sm transition hover:bg-white"
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <Avatar src={user.avatarUrl} size={80} name={user.displayName} className="ring-4 ring-white" />
            {!isSelf ? (
              <button
                type="button"
                onClick={onMessage}
                className="mb-1 inline-flex items-center gap-1.5 rounded-lg bg-[var(--hub-navy)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0e3a5f]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Message
              </button>
            ) : (
              <span className="mb-2 rounded-md bg-[var(--hub-accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--hub-accent)]">
                You
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--hub-navy)]">{user.displayName}</h2>
              {user.role === "admin" && (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--hub-muted)]">
              {user.handle} · {roleLabel(user.role)}
            </p>
            {user.bio && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--hub-ink)]">{user.bio}</p>
            )}
            {user.websiteUrl && (
              <a
                href={user.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--hub-accent)] hover:underline"
              >
                {formatWebsiteLabel(user.websiteUrl)}
              </a>
            )}
          </div>

          <div className="mt-5 border-t border-[var(--hub-line)] pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
              Recent in the Hub
            </p>
            {posts.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--hub-muted)]">No public posts yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {posts.map((post) => (
                  <li key={post.id}>
                    <button
                      type="button"
                      onClick={() => onOpenPost(post.id)}
                      className="w-full rounded-lg border border-[var(--hub-line)] bg-[#f8fafc] px-3 py-2.5 text-left transition hover:border-[var(--hub-accent)] hover:bg-[var(--hub-accent-soft)]"
                    >
                      {post.subject && (
                        <p className="text-xs font-semibold text-[var(--hub-navy)]">{post.subject}</p>
                      )}
                      <p className="mt-0.5 line-clamp-2 text-sm text-[var(--hub-ink)]">
                        {post.content}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--hub-muted)]">
                        {formatRelativeTime(post.createdAt)} · Open in feed
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  count,
  active,
  activeClass = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  count?: number;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition hover:bg-[#eef2f6] ${
        active ? activeClass : ""
      }`}
    >
      {icon}
      {typeof count === "number" && count > 0 && (
        <span className="tabular-nums">{count}</span>
      )}
    </button>
  );
}

function ModerationPanel({
  reports,
  accounts,
  statuses,
  registrationsOpen,
  onResolve,
  onDeleteStatus,
  onOpenPost,
  onSetAccountState,
  onToggleRegistrations,
}: {
  reports: ModerationReport[];
  accounts: LocalAccount[];
  statuses: Status[];
  registrationsOpen: boolean;
  onResolve: (id: string) => void;
  onDeleteStatus: (id: string) => void;
  onOpenPost: (statusId: string) => void;
  onSetAccountState: (userId: string, state: LocalUserState) => void;
  onToggleRegistrations: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="hub-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--hub-navy)]">
          <Settings2 className="h-4 w-4 text-[var(--hub-accent)]" />
          Hub settings
        </div>
        <button
          type="button"
          onClick={onToggleRegistrations}
          className="rounded-lg bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold ring-1 ring-[var(--hub-line)]"
        >
          Member invites: {registrationsOpen ? "Open" : "Invite-only"}
        </button>
      </div>

      <section className="hub-panel p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--hub-navy)]">
          <Flag className="h-4 w-4 text-rose-600" /> Reports
        </h3>
        <div className="space-y-2">
          {reports.map((report) => {
            const status = statuses.find((s) => s.id === report.statusId);
            const reporter = USERS[report.reporterId];
            return (
              <div key={report.id} className="rounded-lg border border-[var(--hub-line)] p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase text-[var(--hub-muted)]">
                    {report.state} · {formatRelativeTime(report.createdAt)}
                  </span>
                  {report.state === "open" && (
                    <div className="flex gap-2">
                      {status && !status.deleted && (
                        <button
                          type="button"
                          onClick={() => onDeleteStatus(status.id)}
                          className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onResolve(report.id)}
                        className="rounded bg-[var(--hub-navy)] px-2 py-1 text-xs font-semibold text-white"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2">{report.reason}</p>
                {status && (
                  <button
                    type="button"
                    onClick={() => onOpenPost(status.id)}
                    className="mt-2 w-full rounded-md border border-[var(--hub-line)] bg-[#f8fafc] px-2.5 py-2 text-left text-xs transition hover:border-[var(--hub-accent)] hover:bg-[var(--hub-accent-soft)]"
                  >
                    <p className="font-semibold text-[var(--hub-navy)]">
                      {USERS[status.authorId]?.displayName ?? "Member"}
                      {status.subject ? ` · ${status.subject}` : ""}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[var(--hub-muted)]">
                      {status.content.replace(/\n+/g, " ")}
                    </p>
                    <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--hub-accent)]">
                      View post in feed →
                    </p>
                  </button>
                )}
                <p className="mt-1 text-xs text-[var(--hub-muted)]">
                  Reported by {reporter?.handle ?? "unknown"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="hub-panel p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--hub-navy)]">
          <Users className="h-4 w-4" /> Guild members
        </h3>
        <div className="space-y-2">
          {accounts.map((account) => {
            const user = USERS[account.userId];
            if (!user) return null;
            const isSelfAdmin = user.id === ADMIN_USER.id;
            return (
              <div
                key={account.userId}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--hub-line)] px-2.5 py-2"
              >
                <Avatar src={user.avatarUrl} size={36} name={user.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.displayName}</p>
                  <p className="truncate text-[11px] text-[var(--hub-muted)]">
                    {user.handle} · {account.state}
                  </p>
                </div>
                {!isSelfAdmin && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="Mute"
                      onClick={() => onSetAccountState(account.userId, "muted")}
                      className="rounded p-1.5 text-[var(--hub-muted)] hover:bg-[#eef2f6]"
                    >
                      <VolumeX className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Suspend"
                      onClick={() => onSetAccountState(account.userId, "suspended")}
                      className="rounded p-1.5 text-[var(--hub-muted)] hover:bg-[#eef2f6]"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetAccountState(account.userId, "active")}
                      className="rounded px-2 py-1 text-[11px] font-semibold text-[var(--hub-accent)] hover:bg-[var(--hub-accent-soft)]"
                    >
                      Restore
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
