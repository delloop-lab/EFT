export type Role = "member" | "author" | "moderator" | "admin";

export type PostStatus = "draft" | "published" | "archived";

export type SubmissionType = "discussion" | "news";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type NotificationType =
  | "comment_on_followed"
  | "comment_on_own"
  | "submission_approved"
  | "submission_rejected"
  | "announcement"
  | "event"
  | "news";

export interface Category {
  id: string;
  name: string;
  type: "news" | "discussion" | "both";
}

export interface Member {
  id: string;
  name: string;
  role: Role;
  bio: string;
  location: string;
  interests: string[];
  memberSince: string;
  avatarColor: string;
  initials: string;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  body: string;
  authorId: string;
  date: string;
  categoryId: string;
  imageUrl?: string;
  status: PostStatus;
  isAnnouncement?: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  body: string;
  authorId: string;
  date: string;
  categoryId: string;
  followers: string[];
  updatedAt: string;
}

export interface Comment {
  id: string;
  discussionId: string;
  authorId: string;
  body: string;
  date: string;
  editedAt?: string;
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
}

export type ResourceKind = "audio" | "video";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  fileName: string;
  href: string;
  duration: string;
  sizeLabel: string;
  format: string;
}

export type ResourceActivityAction = "watched" | "downloaded";

export interface ResourceActivity {
  id: string;
  userId: string;
  resourceId: string;
  action: ResourceActivityAction;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedType?: "discussion" | "news" | "event" | "submission" | "member";
  relatedId?: string;
}

export interface Submission {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  type: SubmissionType;
  authorId: string;
  date: string;
  status: SubmissionStatus;
}

export interface NotificationPreference {
  importantAnnouncements: boolean;
  news: boolean;
  events: boolean;
  discussionsIFollow: boolean;
  commentsOnMyPosts: boolean;
}

export interface DemoState {
  currentUserId: string | null;
  members: Member[];
  posts: Post[];
  discussions: Discussion[];
  comments: Comment[];
  events: EventItem[];
  notifications: Notification[];
  submissions: Submission[];
  preferences: Record<string, NotificationPreference>;
  resourceActivity: ResourceActivity[];
}

export const DEFAULT_PREFERENCES: NotificationPreference = {
  importantAnnouncements: true,
  news: true,
  events: true,
  discussionsIFollow: true,
  commentsOnMyPosts: true,
};

export const TOTAL_ASSOCIATION_MEMBERS = 1024;
