export type Privacy = "public" | "unlisted" | "direct";
export type FeedTab = "timeline" | "interactions" | "direct" | "moderation" | "about";
export type HubRole = "member" | "admin";
export type ReportStatus = "open" | "resolved";
export type LocalUserState = "active" | "muted" | "suspended";
export type NotificationKind = "favourite" | "reblog" | "follow" | "mention" | "reply";

export type HubUser = {
  id: string;
  displayName: string;
  handle: string;
  /** Photo-style avatar URL (demo) */
  avatarUrl: string;
  /** Soft banner / cover for profile card */
  bannerUrl: string;
  role: HubRole;
  bio?: string;
};

export type Reaction = {
  emoji: string;
  count: number;
  reacted: boolean;
};

export type Status = {
  id: string;
  authorId: string;
  subject?: string;
  content: string;
  createdAt: string;
  privacy: Privacy;
  replyCount: number;
  reblogCount: number;
  favouriteCount: number;
  reactions?: Reaction[];
  /** Optional attached image shown in the feed */
  imageUrl?: string;
  imageAlt?: string;
  /** Optional attached video shown in the feed (local mp4 or YouTube URL/id) */
  videoUrl?: string;
  videoPoster?: string;
  /** When set, render as YouTube embed instead of file video */
  youtubeId?: string;
  isDm?: boolean;
  dmParticipants?: string[];
  pinned?: boolean;
  deleted?: boolean;
  inReplyToId?: string;
};

export type HubNotification = {
  id: string;
  actorId: string;
  kind: NotificationKind;
  createdAt: string;
  preview?: string;
};

export type ModerationReport = {
  id: string;
  statusId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
  state: ReportStatus;
};

export type LocalAccount = {
  userId: string;
  state: LocalUserState;
  joinedAt: string;
};

export type InstanceMetrics = {
  serverName: string;
  serverDomain: string;
  version: string;
  ramUsedMb: number;
  ramTotalMb: number;
  cpuPercent: number;
  activeUsers: number;
  localPosts: number;
  memberCount: number;
  maxStatusChars: number;
  registrationsOpen: boolean;
};

export const MEMBER_USER: HubUser = {
  id: "u-marina",
  displayName: "Marina Costa",
  handle: "@marina",
  avatarUrl: "/guild-avatars/marina.jpg",
  bannerUrl:
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format&fit=crop",
  role: "member",
  bio: "Practice circle host · Borrowing Benefits fan",
};

export const ADMIN_USER: HubUser = {
  id: "u-admin",
  displayName: "Hub Admin",
  handle: "@admin",
  avatarUrl: "/guild-avatars/admin.jpg",
  bannerUrl:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80&auto=format&fit=crop",
  role: "admin",
  bio: "Guild Hub steward · member support",
};

/** Switchable demo accounts for client walkthroughs */
export const DEMO_ACCOUNTS: HubUser[] = [MEMBER_USER, ADMIN_USER];

export const USERS: Record<string, HubUser> = {
  "u-marina": MEMBER_USER,
  "u-admin": ADMIN_USER,
  "u-you": {
    id: "u-you",
    displayName: "Alex Rivera",
    handle: "@alex",
    avatarUrl: "/guild-avatars/alex.jpg",
    bannerUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop",
    role: "member",
    bio: "EFT practitioner · Daisy Chain partner · Level 2",
  },
  "u-joao": {
    id: "u-joao",
    displayName: "João Mendes",
    handle: "@joao",
    avatarUrl: "/guild-avatars/joao.jpg",
    bannerUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
    role: "member",
    bio: "Advanced short courses · Surrogate Tapping",
  },
  "u-elena": {
    id: "u-elena",
    displayName: "Claire Linley",
    handle: "@claire",
    avatarUrl: "/guild-avatars/claire.jpg",
    bannerUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop",
    role: "member",
    bio: "Member videos · tapping demos",
  },
  "u-kenji": {
    id: "u-kenji",
    displayName: "Kenji Sato",
    handle: "@kenji",
    avatarUrl: "/guild-avatars/kenji.jpg",
    bannerUrl:
      "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80&auto=format&fit=crop",
    role: "member",
    bio: "Level 3 path · EFT Imagineering",
  },
  "u-sofia": {
    id: "u-sofia",
    displayName: "Sofia Berg",
    handle: "@sofia",
    avatarUrl: "/guild-avatars/sofia.jpg",
    bannerUrl:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80&auto=format&fit=crop",
    role: "member",
    bio: "New members · self-help tapping",
  },
};

export const INSTANCE: InstanceMetrics = {
  serverName: "EFT Guild Hub",
  serverDomain: "eftguild.social",
  version: "EFT Guild Hub · DEMO",
  ramUsedMb: 340,
  ramTotalMb: 1024,
  cpuPercent: 12,
  activeUsers: 48,
  localPosts: 4127,
  memberCount: 360,
  maxStatusChars: 5000,
  registrationsOpen: false,
};

export const INITIAL_FAVOURITES: Record<string, string[]> = {
  "u-marina": ["s2"],
  "u-admin": ["s6"],
};

export const INITIAL_REBLOGS: Record<string, string[]> = {
  "u-marina": ["s3"],
  "u-admin": [],
};

export const INITIAL_LOCAL_ACCOUNTS: LocalAccount[] = [
  { userId: "u-you", state: "active", joinedAt: "2025-11-02" },
  { userId: "u-marina", state: "active", joinedAt: "2025-09-18" },
  { userId: "u-joao", state: "active", joinedAt: "2025-10-04" },
  { userId: "u-elena", state: "active", joinedAt: "2025-12-01" },
  { userId: "u-kenji", state: "active", joinedAt: "2026-01-14" },
  { userId: "u-sofia", state: "active", joinedAt: "2026-02-20" },
  { userId: "u-admin", state: "active", joinedAt: "2025-08-01" },
];

export const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: "r1",
    statusId: "s4",
    reporterId: "u-marina",
    reason: "Please check — looks like a promotional link outside Guild training resources",
    createdAt: "2026-10-06T08:40:00Z",
    state: "open",
  },
];

export const INITIAL_NOTIFICATIONS: HubNotification[] = [
  {
    id: "n1",
    actorId: "u-marina",
    kind: "favourite",
    createdAt: "2026-10-06T14:50:00Z",
    preview: "favorited your tapping practice note",
  },
  {
    id: "n2",
    actorId: "u-joao",
    kind: "follow",
    createdAt: "2026-10-06T14:20:00Z",
    preview: "followed you — Daisy Chain round starting soon",
  },
  {
    id: "n3",
    actorId: "u-elena",
    kind: "mention",
    createdAt: "2026-10-06T12:05:00Z",
    preview: "mentioned you in a tapping video post",
  },
  {
    id: "n4",
    actorId: "u-kenji",
    kind: "reblog",
    createdAt: "2026-10-06T10:40:00Z",
    preview: "reposted your Level 3 study note",
  },
  {
    id: "n5",
    actorId: "u-sofia",
    kind: "reply",
    createdAt: "2026-10-05T18:10:00Z",
    preview: "replied about skilful vs sloppy tapping",
  },
  {
    id: "n6",
    actorId: "u-marina",
    kind: "favourite",
    createdAt: "2026-09-20T09:00:00Z",
    preview: "favorited your Borrowing Benefits tip",
  },
];

export const INITIAL_STATUSES: Status[] = [
  {
    id: "s1",
    authorId: "u-marina",
    subject: "Weekly Practice Circle",
    content:
      "Reminder: EFT Weekly Practice Circle is tonight 🕯️\n\nWe'll warm up with a short self-help tapping round, then pair for 15-minute exchanges. Bring something gentle you're working with — no pressure to go deep.\n\nNew to practice partners? Say hi in the thread and we'll buddy you up. #PracticeCircle #Tapping #EFTGuild",
    createdAt: "2026-10-06T08:12:00Z",
    privacy: "public",
    replyCount: 3,
    reblogCount: 14,
    favouriteCount: 31,
    reactions: [
      { emoji: "🙌", count: 4, reacted: false },
      { emoji: "☕", count: 2, reacted: true },
    ],
    imageUrl: "/guild-feed/workshop.jpg",
    imageAlt: "Members gathered in a small practice circle",
  },
  {
    id: "s2",
    authorId: "u-elena",
    subject: "Skilful EFT",
    content:
      "Been re-reading the Guild's take on skilful EFT vs sloppy tapping.\n\nClean setup language, staying with the client, and not racing the points — that difference shows up fast in sessions. If you're between Level 2 and Level 3, this is gold.\n\nWho else is sharpening their delivery this month? #SkilfulEFT #Training #EFTGuild",
    createdAt: "2026-10-06T07:45:00Z",
    privacy: "public",
    replyCount: 2,
    reblogCount: 42,
    favouriteCount: 89,
    reactions: [
      { emoji: "💜", count: 8, reacted: true },
      { emoji: "✨", count: 3, reacted: false },
    ],
  },
  {
    id: "s3",
    authorId: "u-joao",
    subject: "Daisy Chains",
    content:
      "Our Daisy Chain rotates practice partners every 4 months — offer and receive sessions, make friends, keep the skills warm.\n\nLooking for one more European-timezone member for the next round. Comment if you want in 🔗\n\n#DaisyChains #PracticePartners #EFTGuild",
    createdAt: "2026-10-06T06:20:00Z",
    privacy: "public",
    replyCount: 2,
    reblogCount: 9,
    favouriteCount: 27,
    reactions: [{ emoji: "🌼", count: 5, reacted: false }],
  },
  {
    id: "s4",
    authorId: "u-kenji",
    subject: "Level 3 notes",
    content:
      "Halfway through Level 3 study — navigation, language skills, and the art of delivery are landing differently now.\n\nAlso dipped into Surrogate Tapping and EFT Imagineering in the Advanced Short Course library. The video demos make the steps so much clearer than notes alone.\n\nAnyone else on the Level 3 path want a study buddy? #Level3 #AdvancedEFT #Tapping",
    createdAt: "2026-10-05T22:10:00Z",
    privacy: "public",
    replyCount: 2,
    reblogCount: 18,
    favouriteCount: 55,
    reactions: [
      { emoji: "📓", count: 6, reacted: false },
      { emoji: "🔥", count: 2, reacted: false },
    ],
  },
  {
    id: "s5",
    authorId: "u-sofia",
    subject: "Borrowing Benefits",
    content:
      "Unlisted for facilitators: Borrowing Benefits tap-alongs are such a gentle way to introduce newcomers to the Guild feeling.\n\nTip from last Bluebell Cluster — keep the setup simple, invite people to tap along for themselves, and leave space after for what shifted.\n\nThe video library has brilliant sessions if you want examples before you host. #BorrowingBenefits #BluebellClusters #SelfHelpTapping",
    createdAt: "2026-10-05T19:30:00Z",
    privacy: "unlisted",
    replyCount: 2,
    reblogCount: 7,
    favouriteCount: 19,
  },
  {
    id: "s9",
    authorId: "u-elena",
    subject: "Tapping video",
    content:
      "A clear, gentle demonstration you can tap along with — useful for self-help practice or as a warm-up before a Daisy Chain or Practice Circle session. #Tapping #MemberVideo #EFTGuild",
    createdAt: "2026-10-06T07:10:00Z",
    privacy: "public",
    replyCount: 4,
    reblogCount: 11,
    favouriteCount: 38,
    reactions: [
      { emoji: "🙏", count: 9, reacted: false },
      { emoji: "💛", count: 4, reacted: true },
    ],
    youtubeId: "Qiu2wdnauw4",
  },
  {
    id: "s6",
    authorId: "u-admin",
    subject: "Welcome to the Hub DEMO",
    content:
      "Welcome to the EFT Guild Hub DEMO 💛\n\nInspired by The EFT Guild — a community of learning and support for people who love EFT tapping (practice partners, advanced training, Borrowing Benefits, and more).\n\nThis board is members-only for the walkthrough. Switch Member / Admin in the sidebar to try the roles.\n\nLearn more about the real Guild at eftguild.org #EFTGuild #EFT #Tapping",
    createdAt: "2026-10-05T16:00:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 5,
    favouriteCount: 12,
    pinned: true,
    reactions: [{ emoji: "🎉", count: 12, reacted: false }],
  },
  {
    id: "s7",
    authorId: "u-marina",
    subject: "EFT Cafe Atlantic",
    content:
      "Who's joining EFT Cafe Atlantic this week? Always leave with a new phrasing idea for setups and a warmer sense of the international Guild.\n\nI'll be tapping on \"even though I rush the karate chop…\" 😅 See you there. #EFTCafe #MembersEvents",
    createdAt: "2026-10-05T11:20:00Z",
    privacy: "public",
    replyCount: 2,
    reblogCount: 6,
    favouriteCount: 22,
    reactions: [{ emoji: "☕", count: 7, reacted: false }],
  },
  {
    id: "s8",
    authorId: "u-sofia",
    content:
      "Quick self-help round I used this morning on presentation nerves:\n\nSetup on the side of the hand → eyebrow → side of eye → under eye → under nose → chin → collarbone → under arm → top of head.\n\nNamed the feeling, stayed specific, breathed. SUDs from 7 to 3. Sharing in case it helps another member today. #TappingPoints #SelfHelpEFT",
    createdAt: "2026-10-04T09:40:00Z",
    privacy: "public",
    replyCount: 3,
    reblogCount: 28,
    favouriteCount: 64,
    reactions: [
      { emoji: "🙏", count: 11, reacted: false },
      { emoji: "💪", count: 4, reacted: true },
    ],
    imageUrl: "/guild-feed/calm-hands.jpg",
    imageAlt: "Quiet moment of self-help tapping and breath",
  },
  // Replies — nested under parent posts via inReplyToId
  {
    id: "s1-r1",
    authorId: "u-sofia",
    content:
      "@marina Count me in for tonight — happy to buddy with a new member if anyone needs a partner.",
    createdAt: "2026-10-06T08:28:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 4,
    inReplyToId: "s1",
  },
  {
    id: "s1-r2",
    authorId: "u-kenji",
    content:
      "@marina I'll be there a few minutes late. Looking forward to a gentle warm-up round.",
    createdAt: "2026-10-06T08:41:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s1",
  },
  {
    id: "s1-r3",
    authorId: "u-joao",
    content: "@marina Same here — bring something light. See you in the circle 🙌",
    createdAt: "2026-10-06T08:55:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 3,
    inReplyToId: "s1",
  },
  {
    id: "s2-r1",
    authorId: "u-marina",
    content:
      "@claire This lands for me too — slowing the points and staying with the setup has changed my sessions.",
    createdAt: "2026-10-06T08:02:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 1,
    favouriteCount: 6,
    inReplyToId: "s2",
  },
  {
    id: "s2-r2",
    authorId: "u-kenji",
    content:
      "@claire Between Level 2 and 3 here — the \"not racing the points\" reminder is exactly what I needed.",
    createdAt: "2026-10-06T08:20:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 5,
    inReplyToId: "s2",
  },
  {
    id: "s3-r1",
    authorId: "u-you",
    content: "@joao European timezone — I'd love a spot in the next Daisy Chain round.",
    createdAt: "2026-10-06T06:45:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s3",
  },
  {
    id: "s3-r2",
    authorId: "u-sofia",
    content: "@joao Same — put me on the list if you still have room 🌼",
    createdAt: "2026-10-06T07:05:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 1,
    inReplyToId: "s3",
  },
  {
    id: "s4-r1",
    authorId: "u-marina",
    content:
      "@kenji Happy to be a study buddy — Surrogate Tapping demos helped me most when I was stuck.",
    createdAt: "2026-10-05T22:40:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 3,
    inReplyToId: "s4",
  },
  {
    id: "s4-r2",
    authorId: "u-elena",
    content: "@kenji Level 3 path here too — message me if you want to swap notes weekly.",
    createdAt: "2026-10-05T23:05:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s4",
  },
  {
    id: "s5-r1",
    authorId: "u-marina",
    content:
      "@sofia Love this tip — leaving space after Borrowing Benefits is where the magic shows up.",
    createdAt: "2026-10-05T20:05:00Z",
    privacy: "unlisted",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s5",
  },
  {
    id: "s5-r2",
    authorId: "u-admin",
    content:
      "@sofia Agreed — keep setups simple for newcomers. Great facilitator note for the Bluebell Cluster hosts.",
    createdAt: "2026-10-05T20:22:00Z",
    privacy: "unlisted",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 4,
    inReplyToId: "s5",
  },
  {
    id: "s9-r1",
    authorId: "u-marina",
    content:
      "@claire Beautiful pace — I tapped along before Practice Circle and felt much clearer going in.",
    createdAt: "2026-10-06T07:25:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 1,
    favouriteCount: 8,
    inReplyToId: "s9",
  },
  {
    id: "s9-r2",
    authorId: "u-joao",
    content:
      "@claire The setup language landed for me. Saving this for Daisy Chain warm-ups.",
    createdAt: "2026-10-06T07:38:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 5,
    inReplyToId: "s9",
  },
  {
    id: "s9-r3",
    authorId: "u-sofia",
    content: "@claire Thank you for sharing this — gentle and clear. Perfect for self-help days.",
    createdAt: "2026-10-06T07:52:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 6,
    inReplyToId: "s9",
  },
  {
    id: "s9-r4",
    authorId: "u-kenji",
    content: "@claire Watched twice — the phrasing on the collarbone point especially helped.",
    createdAt: "2026-10-06T08:05:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 3,
    inReplyToId: "s9",
  },
  {
    id: "s7-r1",
    authorId: "u-you",
    content: "@marina I'll be at Cafe Atlantic — save me a seat near the front ☕",
    createdAt: "2026-10-05T12:10:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s7",
  },
  {
    id: "s7-r2",
    authorId: "u-elena",
    content: "@marina \"Even though I rush the karate chop…\" — that setup made me laugh. See you there!",
    createdAt: "2026-10-05T13:02:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 4,
    inReplyToId: "s7",
  },
  {
    id: "s8-r1",
    authorId: "u-marina",
    content:
      "@sofia Used this sequence before a call today — SUDs dropped similarly. Grateful you posted it.",
    createdAt: "2026-10-04T10:15:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 5,
    inReplyToId: "s8",
  },
  {
    id: "s8-r2",
    authorId: "u-joao",
    content: "@sofia Staying specific with the feeling is the bit I always rush. Good reminder.",
    createdAt: "2026-10-04T11:00:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 1,
    favouriteCount: 3,
    inReplyToId: "s8",
  },
  {
    id: "s8-r3",
    authorId: "u-kenji",
    content: "@sofia Bookmarking this for mornings when presentation nerves show up.",
    createdAt: "2026-10-04T14:20:00Z",
    privacy: "public",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 2,
    inReplyToId: "s8",
  },
  {
    id: "dm1",
    authorId: "u-you",
    content:
      "Marina — thanks for hosting Practice Circle. Can you send me the Borrowing Benefits flyer draft when it's ready?",
    createdAt: "2026-10-06T09:01:00Z",
    privacy: "direct",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 0,
    isDm: true,
    dmParticipants: ["u-you", "u-marina"],
  },
  {
    id: "dm2",
    authorId: "u-joao",
    content:
      "Marina — found a great Surrogate Tapping demo in the Advanced Short Course library. Want the title before our Daisy Chain swap?",
    createdAt: "2026-10-05T21:15:00Z",
    privacy: "direct",
    replyCount: 1,
    reblogCount: 0,
    favouriteCount: 0,
    isDm: true,
    dmParticipants: ["u-marina", "u-joao"],
  },
  {
    id: "dm3",
    authorId: "u-joao",
    content:
      "Admin: two pending member invites look good — both Level 1 graduates looking for practice partners. Ready to approve when you are.",
    createdAt: "2026-10-06T07:05:00Z",
    privacy: "direct",
    replyCount: 0,
    reblogCount: 0,
    favouriteCount: 0,
    isDm: true,
    dmParticipants: ["u-admin", "u-joao"],
  },
];

export const REACTION_PICKER = ["🙌", "💜", "✨", "🔥", "☕", "🎉", "❤️", "👍"];

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function roleLabel(role: HubRole) {
  return role === "admin" ? "Guild admin" : "Member";
}
