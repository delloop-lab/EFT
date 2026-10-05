"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/format";
import { TOTAL_ASSOCIATION_MEMBERS } from "@/lib/types";

export default function MembersPage() {
  const { getMembers } = useDataStore();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [interest, setInterest] = useState("all");

  const members = getMembers();
  const locations = useMemo(
    () => Array.from(new Set(members.map((m) => m.location))).sort(),
    [members]
  );
  const interests = useMemo(
    () => Array.from(new Set(members.flatMap((m) => m.interests))).sort(),
    [members]
  );

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.bio.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      m.interests.some((i) => i.toLowerCase().includes(q));
    const matchesLocation = location === "all" || m.location === location;
    const matchesInterest = interest === "all" || m.interests.includes(interest);
    return matchesQuery && matchesLocation && matchesInterest;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold">Members</h1>
        <p className="mt-2 text-[var(--muted)]">
          The association has approximately{" "}
          <strong className="text-[var(--navy)]">
            {TOTAL_ASSOCIATION_MEMBERS.toLocaleString("en-GB")} members
          </strong>
          . This directory shows a representative sample for the demonstration.
        </p>
      </div>

      <div className="card grid gap-3 p-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="member-search">Search</label>
          <input
            id="member-search"
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, interest, location…"
          />
        </div>
        <div>
          <label className="label" htmlFor="member-location">Location</label>
          <select
            id="member-location"
            className="field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="member-interest">Interest</label>
          <select
            id="member-interest"
            className="field"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
          >
            <option value="all">All interests</option>
            {interests.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Showing {filtered.length} of {members.length} sample profiles
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((member) => (
          <Link
            key={member.id}
            href={`/members/${member.id}`}
            className="card flex gap-4 p-4 transition hover:border-[var(--blue)]"
          >
            <Avatar member={member} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-[var(--navy)]">{member.name}</h2>
              <p className="text-sm text-[var(--muted)]">{member.location}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--text)]">{member.bio}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {member.interests.slice(0, 3).map((i) => (
                  <span key={i} className="badge">{i}</span>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Member since {formatDate(member.memberSince)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
