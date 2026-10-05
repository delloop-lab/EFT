"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DemoBadge } from "@/components/DemoBadge";
import { Avatar } from "@/components/Avatar";
import { roleLabel, useDataStore } from "@/lib/data-store";
import { demoUsers } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const { ready, currentUser, loginAs } = useDataStore();

  useEffect(() => {
    if (ready && currentUser) {
      router.replace("/");
    }
  }, [ready, currentUser, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg p-8 shadow-sm animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="The EFT Centre" width={160} height={54} priority />
          <div className="mt-3 flex flex-col items-center gap-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--blue)]">
              The EFT Centre
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold text-[var(--navy)] sm:text-4xl">Member Hub</h1>
              <DemoBadge />
            </div>
          </div>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            Choose a demo user to explore the prototype. Nothing here is a real login —
            this is for client demonstration only.
          </p>
        </div>

        <div className="space-y-3">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => loginAs(user.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-3 text-left transition hover:border-[var(--blue)] hover:bg-[var(--surface-muted)]"
            >
              <Avatar member={user} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[var(--navy)]">{user.name}</div>
                <div className="text-sm text-[var(--muted)]">{roleLabel(user.role)}</div>
              </div>
              <span className="text-sm font-medium text-[var(--blue)]">Enter</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Demo data is stored in this browser only. Use Reset Demo in Admin to restore the original sample.
        </p>
      </div>
    </div>
  );
}
