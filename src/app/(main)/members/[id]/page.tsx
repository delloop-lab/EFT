"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { roleLabel, useDataStore } from "@/lib/data-store";
import { formatDate } from "@/lib/format";

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const { currentUser, getMember, updateProfile } = useDataStore();
  const member = getMember(params.id);
  const isOwn = currentUser?.id === member?.id;
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(member?.bio ?? "");
  const [location, setLocation] = useState(member?.location ?? "");
  const [interests, setInterests] = useState(member?.interests.join(", ") ?? "");

  if (!member) {
    return (
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Member not found</h1>
        <Link href="/members" className="mt-4 inline-block text-[var(--blue)]">
          Back to members
        </Link>
      </div>
    );
  }

  function startEdit() {
    setBio(member!.bio);
    setLocation(member!.location);
    setInterests(member!.interests.join(", "));
    setEditing(true);
  }

  function save() {
    updateProfile(member!.id, {
      bio: bio.trim(),
      location: location.trim(),
      interests: interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
    });
    setEditing(false);
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link href="/members" className="text-sm font-medium text-[var(--blue)]">
        ← Back to members
      </Link>
      <div className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar member={member} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold">{member.name}</h1>
              <span className="badge badge-blue">{roleLabel(member.role)}</span>
            </div>
            <p className="mt-1 text-[var(--muted)]">{member.location}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Member since {formatDate(member.memberSince)}
            </p>
          </div>
          {isOwn && !editing && (
            <button type="button" className="btn-secondary" onClick={startEdit}>
              Edit profile
            </button>
          )}
        </div>

        {!editing ? (
          <>
            <h2 className="mt-8 text-lg font-semibold">Biography</h2>
            <p className="prose-body mt-2">{member.bio}</p>
            <h2 className="mt-6 text-lg font-semibold">Interests</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.interests.map((i) => (
                <span key={i} className="badge">{i}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 space-y-4">
            <div>
              <label className="label">Biography</label>
              <textarea className="field min-h-28" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="field" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Interests (comma separated)</label>
              <input className="field" value={interests} onChange={(e) => setInterests(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-primary" onClick={save}>Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
