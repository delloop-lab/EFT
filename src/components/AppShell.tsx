"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/DemoBadge";
import { Avatar } from "@/components/Avatar";
import { useDataStore } from "@/lib/data-store";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/discussions", label: "Discussions" },
  { href: "/events", label: "Events" },
  { href: "/resources", label: "Resources" },
  { href: "/members", label: "Members" },
  { href: "/account", label: "My Account" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser, canModerate, unreadCount, logout } = useDataStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (ready && !currentUser) {
      router.replace("/login");
    }
  }, [ready, currentUser, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!ready || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        Loading demo…
      </div>
    );
  }

  const items = canModerate
    ? [...navItems, { href: "/admin", label: "Admin" }]
    : navItems;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo-guild.png" alt="The EFT Guild" width={56} height={56} priority />
            <DemoBadge />
          </Link>

          <form onSubmit={onSearch} className="ml-auto hidden min-w-0 flex-1 max-w-sm md:block">
            <label className="sr-only" htmlFor="global-search">
              Search
            </label>
            <input
              id="global-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, discussions, events…"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm outline-none ring-[var(--cyan)] focus:bg-white focus:ring-2"
            />
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative rounded-md px-2 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)]"
              aria-label="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--green)] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-md px-2 py-1 hover:bg-[var(--surface-muted)] sm:flex"
            >
              <Avatar member={currentUser} size="sm" />
              <span className="text-sm font-medium text-[var(--navy)]">{currentUser.name}</span>
            </Link>
            <button
              type="button"
              className="rounded-md px-2 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)] md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-[var(--navy)] text-white"
                  : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="ml-auto rounded-md px-3 py-2 text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            Switch user
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-t border-[var(--border)] bg-white px-4 py-3 md:hidden">
            <form onSubmit={onSearch} className="mb-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none ring-[var(--cyan)] focus:ring-2"
              />
            </form>
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-[var(--navy)] text-white"
                      : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/notifications"
                className="rounded-md px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-muted)]"
              >
                Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="rounded-md px-3 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              >
                Switch user
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>The EFT Guild Member Hub</p>
          <p className="flex items-center gap-2">
            <DemoBadge /> Prototype for demonstration only
          </p>
        </div>
      </footer>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      )}
    </svg>
  );
}
