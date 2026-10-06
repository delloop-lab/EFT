import {
  Bell,
  Headphones,
  Lock,
  MessageSquare,
  Shield,
  Users,
  Video,
  Link2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "./guild-hub.css";

const FEATURES = [
  {
    icon: Users,
    title: "Guild Feed",
    description:
      "A private timeline for training reflections, practice invites, Daisy Chains, and peer support — built for how EFT practitioners actually talk.",
  },
  {
    icon: Video,
    title: "Rich practice media",
    description:
      "Share video clips, guided tapping audio, images, and article link cards so members can learn and tap along without leaving the Hub.",
  },
  {
    icon: MessageSquare,
    title: "Direct messages",
    description:
      "One-to-one conversations for practice partners, cluster hosts, and quiet check-ins — separate from the open Guild Feed.",
  },
  {
    icon: Bell,
    title: "Activity & notifications",
    description:
      "Members stay in the loop on replies, mentions, favourites, and follows, with quick links back into the relevant post.",
  },
  {
    icon: Lock,
    title: "Privacy controls",
    description:
      "Post as Guild-visible, unlisted for facilitators, or direct — so sensitive practice notes stay where they belong.",
  },
  {
    icon: Shield,
    title: "Admin control you actually own",
    description:
      "See who’s active, act on reports, mute or suspend members, pin what matters, and keep invites closed — the Guild sets the rules, not a third-party platform.",
  },
  {
    icon: Headphones,
    title: "Member profiles",
    description:
      "Bios, practice websites, and recent posts help members find partners, hosts, and mentors across the Guild.",
  },
  {
    icon: Link2,
    title: "Invite-only access",
    description:
      "No public timelines, no open registration, no outside social networks — a members space that stays with The EFT Guild.",
  },
] as const;

const BENEFITS = [
  {
    title: "One home for Guild conversation",
    body: "Stop splitting practice talk across Facebook groups, email threads, and chat apps. Members know where training, tapping, and support live.",
  },
  {
    title: "Designed around EFT practice",
    body: "Borrowing Benefits, Bluebell Clusters, Daisy Chains, and self-help tapping fit naturally — not squeezed into a generic social feed.",
  },
  {
    title: "Safer for a professional community",
    body: "Invite-only membership, privacy levels, and moderation tools protect the tone of a learning community of practitioners.",
  },
  {
    title: "Less admin drag, more Guild control",
    body: "One clear panel instead of hunting through Facebook group settings or Discord roles. Resolve issues quickly, keep membership invite-only, and protect the professional tone of the Guild without depending on tools you don’t own.",
  },
] as const;

export function GuildHubFeatures() {
  return (
    <div className="guild-hub-shell">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="hub-panel mb-5 overflow-hidden">
          <div className="hub-header-banner border-b border-[var(--hub-line)] text-white">
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
                    Features &amp; Benefits
                  </h1>
                  <p className="mt-0.5 max-w-xl text-sm text-slate-200">
                    What the EFT Guild Hub gives members — and why it matters for the Guild.
                  </p>
                </div>
              </div>
              <div
                role="tablist"
                aria-label="Demo guides"
                className="flex flex-wrap gap-1.5 self-start sm:self-end"
              >
                <Link
                  href="/new"
                  role="tab"
                  aria-selected="false"
                  className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/25"
                >
                  Demo walkthrough
                </Link>
                <span
                  role="tab"
                  aria-selected="true"
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--hub-navy)]"
                >
                  Features &amp; Benefits
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="hub-panel mb-5 p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-[var(--hub-navy)] sm:text-xl">
            A private members space for discussions and interaction
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--hub-muted)] sm:text-base">
            The EFT Guild Hub is a members-only board for Guild practitioners — not the public
            website, not a public social network. It keeps conversation, practice media, and peer
            support in one calm place the Guild can own and steward.
          </p>
        </section>

        <section className="mb-5" aria-labelledby="features-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
                Features
              </p>
              <h2 id="features-heading" className="mt-1 text-lg font-semibold text-[var(--hub-navy)]">
                Built for how the Guild works
              </h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article key={title} className="hub-panel p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--hub-accent-soft)] text-[var(--hub-accent)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--hub-navy)]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--hub-muted)]">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-5" aria-labelledby="benefits-heading">
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
              Benefits
            </p>
            <h2 id="benefits-heading" className="mt-1 text-lg font-semibold text-[var(--hub-navy)]">
              Why this helps The EFT Guild
            </h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {BENEFITS.map((benefit, index) => (
              <article key={benefit.title} className="hub-panel p-5">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--hub-navy)] text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--hub-navy)]">{benefit.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--hub-muted)]">
                      {benefit.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="hub-panel mb-2 overflow-hidden">
          <div className="flex flex-col gap-4 bg-[var(--hub-accent-soft)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-lg font-semibold text-[var(--hub-navy)]">See it in action</h2>
              <p className="mt-1 max-w-lg text-sm text-[var(--hub-muted)]">
                Explore the interactive demo as a member or admin — feed, media, messages,
                notifications, and moderation.
              </p>
            </div>
            <Link
              href="/new"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--hub-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e3a5f]"
            >
              Open Guild Hub demo →
            </Link>
          </div>
        </section>
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
    </div>
  );
}
