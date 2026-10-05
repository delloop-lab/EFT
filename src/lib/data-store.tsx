"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { categories, getSeedState } from "./mock-data";
import type {
  Comment,
  DemoState,
  Discussion,
  EventItem,
  Member,
  Notification,
  NotificationPreference,
  Post,
  PostStatus,
  ResourceActivity,
  ResourceActivityAction,
  Role,
  Submission,
  SubmissionType,
} from "./types";
import { DEFAULT_PREFERENCES } from "./types";

const STORAGE_KEY = "eft-demo-state-v1";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadState(): DemoState {
  if (typeof window === "undefined") return getSeedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getSeedState();
    const parsed = JSON.parse(raw) as DemoState;
    return {
      ...getSeedState(),
      ...parsed,
      preferences: {
        ...getSeedState().preferences,
        ...(parsed.preferences || {}),
      },
      resourceActivity: parsed.resourceActivity ?? [],
    };
  } catch {
    return getSeedState();
  }
}

function saveState(state: DemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface DataStoreValue {
  ready: boolean;
  state: DemoState;
  currentUser: Member | null;
  categories: typeof categories;
  canModerate: boolean;
  canPublishNews: boolean;
  canManageEvents: boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
  resetDemo: () => void;
  getMembers: () => Member[];
  getMember: (id: string) => Member | undefined;
  getPosts: (status?: PostStatus) => Post[];
  getPost: (id: string) => Post | undefined;
  getDiscussions: () => Discussion[];
  getDiscussion: (id: string) => Discussion | undefined;
  getComments: (discussionId?: string) => Comment[];
  getEvents: () => EventItem[];
  getNotifications: (userId?: string) => Notification[];
  getSubmissions: (status?: Submission["status"]) => Submission[];
  getPreferences: (userId?: string) => NotificationPreference;
  getResourceActivity: (userId?: string) => ResourceActivity[];
  trackResourceActivity: (resourceId: string, action: ResourceActivityAction) => void;
  updateProfile: (memberId: string, updates: Partial<Member>) => void;
  updatePreferences: (userId: string, prefs: NotificationPreference) => void;
  createDiscussion: (input: {
    title: string;
    body: string;
    categoryId: string;
  }) => Discussion;
  createComment: (discussionId: string, body: string) => Comment;
  updateComment: (commentId: string, body: string) => void;
  deleteComment: (commentId: string) => void;
  followDiscussion: (discussionId: string) => void;
  unfollowDiscussion: (discussionId: string) => void;
  createSubmission: (input: {
    title: string;
    content: string;
    categoryId: string;
    type: SubmissionType;
  }) => Submission;
  approveSubmission: (submissionId: string, edits?: { title?: string; content?: string }) => void;
  rejectSubmission: (submissionId: string) => void;
  createPost: (input: {
    title: string;
    summary: string;
    body: string;
    categoryId: string;
    status: PostStatus;
    isAnnouncement?: boolean;
  }) => Post;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  createEvent: (input: Omit<EventItem, "id">) => EventItem;
  updateEvent: (eventId: string, updates: Partial<EventItem>) => void;
  deleteEvent: (eventId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  search: (query: string) => SearchResult[];
  unreadCount: number;
}

export interface SearchResult {
  type: "news" | "discussion" | "event" | "member";
  id: string;
  title: string;
  subtitle?: string;
}

const DataStoreContext = createContext<DataStoreValue | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(getSeedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const update = useCallback((updater: (prev: DemoState) => DemoState) => {
    setState((prev) => updater(prev));
  }, []);

  const currentUser = useMemo(
    () => state.members.find((m) => m.id === state.currentUserId) ?? null,
    [state.members, state.currentUserId]
  );

  const role = currentUser?.role;
  const canModerate = role === "moderator" || role === "admin";
  const canPublishNews = role === "author" || role === "moderator" || role === "admin";
  const canManageEvents = role === "admin";

  const loginAs = useCallback((userId: string) => {
    update((prev) => ({ ...prev, currentUserId: userId }));
  }, [update]);

  const logout = useCallback(() => {
    update((prev) => ({ ...prev, currentUserId: null }));
  }, [update]);

  const resetDemo = useCallback(() => {
    const seed = getSeedState();
    setState(seed);
    saveState(seed);
  }, []);

  const getMembers = useCallback(() => state.members, [state.members]);
  const getMember = useCallback(
    (id: string) => state.members.find((m) => m.id === id),
    [state.members]
  );
  const getPosts = useCallback(
    (status?: PostStatus) =>
      [...state.posts]
        .filter((p) => (status ? p.status === status : true))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.posts]
  );
  const getPost = useCallback(
    (id: string) => state.posts.find((p) => p.id === id),
    [state.posts]
  );
  const getDiscussions = useCallback(
    () =>
      [...state.discussions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.discussions]
  );
  const getDiscussion = useCallback(
    (id: string) => state.discussions.find((d) => d.id === id),
    [state.discussions]
  );
  const getComments = useCallback(
    (discussionId?: string) =>
      [...state.comments]
        .filter((c) => (discussionId ? c.discussionId === discussionId : true))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.comments]
  );
  const getEvents = useCallback(
    () => [...state.events].sort((a, b) => a.date.localeCompare(b.date)),
    [state.events]
  );
  const getNotifications = useCallback(
    (userId?: string) => {
      const uidFilter = userId ?? state.currentUserId;
      return [...state.notifications]
        .filter((n) => n.userId === uidFilter)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    [state.notifications, state.currentUserId]
  );
  const getSubmissions = useCallback(
    (status?: Submission["status"]) =>
      [...state.submissions]
        .filter((s) => (status ? s.status === status : true))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.submissions]
  );
  const getPreferences = useCallback(
    (userId?: string) => {
      const id = userId ?? state.currentUserId;
      if (!id) return { ...DEFAULT_PREFERENCES };
      return state.preferences[id] ?? { ...DEFAULT_PREFERENCES };
    },
    [state.preferences, state.currentUserId]
  );

  const getResourceActivity = useCallback(
    (userId?: string) => {
      const uidFilter = userId ?? state.currentUserId;
      return [...(state.resourceActivity ?? [])]
        .filter((a) => a.userId === uidFilter)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    [state.resourceActivity, state.currentUserId]
  );

  const trackResourceActivity = useCallback(
    (resourceId: string, action: ResourceActivityAction) => {
      if (!state.currentUserId) return;
      const userId = state.currentUserId;
      const now = new Date().toISOString();
      update((prev) => {
        const existing = (prev.resourceActivity ?? []).find(
          (a) => a.userId === userId && a.resourceId === resourceId && a.action === action
        );
        if (existing) {
          return {
            ...prev,
            resourceActivity: (prev.resourceActivity ?? []).map((a) =>
              a.id === existing.id ? { ...a, date: now } : a
            ),
          };
        }
        return {
          ...prev,
          resourceActivity: [
            ...(prev.resourceActivity ?? []),
            {
              id: uid("resact"),
              userId,
              resourceId,
              action,
              date: now,
            },
          ],
        };
      });
    },
    [state.currentUserId, update]
  );

  const updateProfile = useCallback(
    (memberId: string, updates: Partial<Member>) => {
      update((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId ? { ...m, ...updates, id: m.id, role: m.role } : m
        ),
      }));
    },
    [update]
  );

  const updatePreferences = useCallback(
    (userId: string, prefs: NotificationPreference) => {
      update((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [userId]: prefs },
      }));
    },
    [update]
  );

  const createDiscussion = useCallback(
    (input: { title: string; body: string; categoryId: string }) => {
      if (!state.currentUserId) throw new Error("Not logged in");
      const now = new Date().toISOString();
      const discussion: Discussion = {
        id: uid("disc"),
        title: input.title,
        body: input.body,
        authorId: state.currentUserId,
        date: now,
        categoryId: input.categoryId,
        followers: [state.currentUserId],
        updatedAt: now,
      };
      update((prev) => ({
        ...prev,
        discussions: [discussion, ...prev.discussions],
      }));
      return discussion;
    },
    [state.currentUserId, update]
  );

  const createComment = useCallback(
    (discussionId: string, body: string) => {
      if (!state.currentUserId) throw new Error("Not logged in");
      const now = new Date().toISOString();
      const comment: Comment = {
        id: uid("cmt"),
        discussionId,
        authorId: state.currentUserId,
        body,
        date: now,
      };

      update((prev) => {
        const discussion = prev.discussions.find((d) => d.id === discussionId);
        if (!discussion) return prev;

        const author = prev.members.find((m) => m.id === state.currentUserId);
        const authorName = author?.name ?? "A member";
        const prefs = prev.preferences;
        const newNotifications: Notification[] = [];

        for (const followerId of discussion.followers) {
          if (followerId === state.currentUserId) continue;
          const followerPrefs = prefs[followerId] ?? DEFAULT_PREFERENCES;
          if (!followerPrefs.discussionsIFollow) continue;
          newNotifications.push({
            id: uid("ntf"),
            userId: followerId,
            type: "comment_on_followed",
            title: "New comment on a discussion you follow",
            message: `${authorName} commented on “${discussion.title}”.`,
            date: now,
            read: false,
            relatedType: "discussion",
            relatedId: discussionId,
          });
        }

        if (
          discussion.authorId !== state.currentUserId &&
          !discussion.followers.includes(discussion.authorId)
        ) {
          const ownerPrefs = prefs[discussion.authorId] ?? DEFAULT_PREFERENCES;
          if (ownerPrefs.commentsOnMyPosts) {
            newNotifications.push({
              id: uid("ntf"),
              userId: discussion.authorId,
              type: "comment_on_own",
              title: "New comment on your discussion",
              message: `${authorName} commented on “${discussion.title}”.`,
              date: now,
              read: false,
              relatedType: "discussion",
              relatedId: discussionId,
            });
          }
        } else if (
          discussion.authorId !== state.currentUserId &&
          discussion.followers.includes(discussion.authorId)
        ) {
          // Already notified via follow path; also mark as comment_on_own style if preferred
          // Keep single notification from follow path to avoid duplicates
        }

        return {
          ...prev,
          comments: [...prev.comments, comment],
          discussions: prev.discussions.map((d) =>
            d.id === discussionId ? { ...d, updatedAt: now } : d
          ),
          notifications: [...newNotifications, ...prev.notifications],
        };
      });

      return comment;
    },
    [state.currentUserId, update]
  );

  const updateComment = useCallback(
    (commentId: string, body: string) => {
      const now = new Date().toISOString();
      update((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId ? { ...c, body, editedAt: now } : c
        ),
      }));
    },
    [update]
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      update((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
    },
    [update]
  );

  const followDiscussion = useCallback(
    (discussionId: string) => {
      if (!state.currentUserId) return;
      const userId = state.currentUserId;
      update((prev) => ({
        ...prev,
        discussions: prev.discussions.map((d) =>
          d.id === discussionId && !d.followers.includes(userId)
            ? { ...d, followers: [...d.followers, userId] }
            : d
        ),
      }));
    },
    [state.currentUserId, update]
  );

  const unfollowDiscussion = useCallback(
    (discussionId: string) => {
      if (!state.currentUserId) return;
      const userId = state.currentUserId;
      update((prev) => ({
        ...prev,
        discussions: prev.discussions.map((d) =>
          d.id === discussionId
            ? { ...d, followers: d.followers.filter((id) => id !== userId) }
            : d
        ),
      }));
    },
    [state.currentUserId, update]
  );

  const createSubmission = useCallback(
    (input: {
      title: string;
      content: string;
      categoryId: string;
      type: SubmissionType;
    }) => {
      if (!state.currentUserId) throw new Error("Not logged in");
      const submission: Submission = {
        id: uid("sub"),
        title: input.title,
        content: input.content,
        categoryId: input.categoryId,
        type: input.type,
        authorId: state.currentUserId,
        date: new Date().toISOString(),
        status: "pending",
      };
      update((prev) => ({
        ...prev,
        submissions: [submission, ...prev.submissions],
      }));
      return submission;
    },
    [state.currentUserId, update]
  );

  const approveSubmission = useCallback(
    (submissionId: string, edits?: { title?: string; content?: string }) => {
      const now = new Date().toISOString();
      update((prev) => {
        const submission = prev.submissions.find((s) => s.id === submissionId);
        if (!submission || submission.status !== "pending") return prev;

        const title = edits?.title ?? submission.title;
        const content = edits?.content ?? submission.content;
        let discussions = prev.discussions;
        let posts = prev.posts;
        let relatedType: Notification["relatedType"] = "discussion";
        let relatedId = "";

        if (submission.type === "discussion") {
          const discussion: Discussion = {
            id: uid("disc"),
            title,
            body: content,
            authorId: submission.authorId,
            date: now,
            categoryId: submission.categoryId,
            followers: [submission.authorId],
            updatedAt: now,
          };
          discussions = [discussion, ...discussions];
          relatedId = discussion.id;
          relatedType = "discussion";
        } else {
          const post: Post = {
            id: uid("post"),
            title,
            summary: content.slice(0, 160) + (content.length > 160 ? "…" : ""),
            body: content,
            authorId: submission.authorId,
            date: now,
            categoryId: submission.categoryId,
            status: "published",
          };
          posts = [post, ...posts];
          relatedId = post.id;
          relatedType = "news";
        }

        const notification: Notification = {
          id: uid("ntf"),
          userId: submission.authorId,
          type: "submission_approved",
          title: "Submission approved",
          message: `Your submission “${title}” has been approved.`,
          date: now,
          read: false,
          relatedType,
          relatedId,
        };

        return {
          ...prev,
          discussions,
          posts,
          submissions: prev.submissions.map((s) =>
            s.id === submissionId
              ? { ...s, title, content, status: "approved" as const }
              : s
          ),
          notifications: [notification, ...prev.notifications],
        };
      });
    },
    [update]
  );

  const rejectSubmission = useCallback(
    (submissionId: string) => {
      const now = new Date().toISOString();
      update((prev) => {
        const submission = prev.submissions.find((s) => s.id === submissionId);
        if (!submission || submission.status !== "pending") return prev;

        const notification: Notification = {
          id: uid("ntf"),
          userId: submission.authorId,
          type: "submission_rejected",
          title: "Submission not approved",
          message: `Your submission “${submission.title}” was not approved.`,
          date: now,
          read: false,
          relatedType: "submission",
          relatedId: submission.id,
        };

        return {
          ...prev,
          submissions: prev.submissions.map((s) =>
            s.id === submissionId ? { ...s, status: "rejected" as const } : s
          ),
          notifications: [notification, ...prev.notifications],
        };
      });
    },
    [update]
  );

  const createPost = useCallback(
    (input: {
      title: string;
      summary: string;
      body: string;
      categoryId: string;
      status: PostStatus;
      isAnnouncement?: boolean;
    }) => {
      if (!state.currentUserId) throw new Error("Not logged in");
      const now = new Date().toISOString();
      const post: Post = {
        id: uid("post"),
        ...input,
        authorId: state.currentUserId,
        date: now,
      };

      update((prev) => {
        let notifications = prev.notifications;
        if (post.status === "published" && post.isAnnouncement) {
          const announcementNotes: Notification[] = prev.members
            .filter((m) => m.id !== state.currentUserId)
            .filter((m) => (prev.preferences[m.id] ?? DEFAULT_PREFERENCES).importantAnnouncements)
            .map((m) => ({
              id: uid("ntf"),
              userId: m.id,
              type: "announcement" as const,
              title: "New association announcement",
              message: `A new association announcement has been published: ${post.title}`,
              date: now,
              read: false,
              relatedType: "news" as const,
              relatedId: post.id,
            }));
          notifications = [...announcementNotes, ...notifications];
        }
        return { ...prev, posts: [post, ...prev.posts], notifications };
      });
      return post;
    },
    [state.currentUserId, update]
  );

  const updatePost = useCallback(
    (postId: string, updates: Partial<Post>) => {
      update((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p.id === postId ? { ...p, ...updates } : p)),
      }));
    },
    [update]
  );

  const createEvent = useCallback(
    (input: Omit<EventItem, "id">) => {
      const event: EventItem = { id: uid("evt"), ...input };
      update((prev) => ({ ...prev, events: [...prev.events, event] }));
      return event;
    },
    [update]
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<EventItem>) => {
      update((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === eventId ? { ...e, ...updates } : e)),
      }));
    },
    [update]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      update((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== eventId),
      }));
    },
    [update]
  );

  const markNotificationRead = useCallback(
    (notificationId: string) => {
      update((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
    },
    [update]
  );

  const markAllNotificationsRead = useCallback(() => {
    if (!state.currentUserId) return;
    const userId = state.currentUserId;
    update((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      ),
    }));
  }, [state.currentUserId, update]);

  const search = useCallback(
    (query: string): SearchResult[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const results: SearchResult[] = [];

      for (const post of state.posts.filter((p) => p.status === "published")) {
        if (
          post.title.toLowerCase().includes(q) ||
          post.summary.toLowerCase().includes(q) ||
          post.body.toLowerCase().includes(q)
        ) {
          results.push({ type: "news", id: post.id, title: post.title, subtitle: post.summary });
        }
      }
      for (const disc of state.discussions) {
        if (disc.title.toLowerCase().includes(q) || disc.body.toLowerCase().includes(q)) {
          results.push({ type: "discussion", id: disc.id, title: disc.title, subtitle: disc.body.slice(0, 120) });
        }
      }
      for (const event of state.events) {
        if (
          event.name.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q)
        ) {
          results.push({ type: "event", id: event.id, title: event.name, subtitle: event.location });
        }
      }
      for (const member of state.members) {
        if (
          member.name.toLowerCase().includes(q) ||
          member.location.toLowerCase().includes(q) ||
          member.bio.toLowerCase().includes(q) ||
          member.interests.some((i) => i.toLowerCase().includes(q))
        ) {
          results.push({ type: "member", id: member.id, title: member.name, subtitle: member.location });
        }
      }
      return results.slice(0, 40);
    },
    [state]
  );

  const unreadCount = useMemo(
    () =>
      state.notifications.filter(
        (n) => n.userId === state.currentUserId && !n.read
      ).length,
    [state.notifications, state.currentUserId]
  );

  const value: DataStoreValue = {
    ready,
    state,
    currentUser,
    categories,
    canModerate,
    canPublishNews,
    canManageEvents,
    loginAs,
    logout,
    resetDemo,
    getMembers,
    getMember,
    getPosts,
    getPost,
    getDiscussions,
    getDiscussion,
    getComments,
    getEvents,
    getNotifications,
    getSubmissions,
    getPreferences,
    getResourceActivity,
    trackResourceActivity,
    updateProfile,
    updatePreferences,
    createDiscussion,
    createComment,
    updateComment,
    deleteComment,
    followDiscussion,
    unfollowDiscussion,
    createSubmission,
    approveSubmission,
    rejectSubmission,
    createPost,
    updatePost,
    createEvent,
    updateEvent,
    deleteEvent,
    markNotificationRead,
    markAllNotificationsRead,
    search,
    unreadCount,
  };

  return (
    <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within DataStoreProvider");
  return ctx;
}

export function roleLabel(role: Role) {
  switch (role) {
    case "member":
      return "Member";
    case "author":
      return "Author";
    case "moderator":
      return "Moderator";
    case "admin":
      return "Admin";
  }
}
