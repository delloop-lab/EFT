"use client";

import { useMemo, useState } from "react";
import { resources } from "@/lib/resources";
import type { ResourceKind } from "@/lib/types";

type Filter = "all" | ResourceKind;

export default function ResourcesPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(
    () => (filter === "all" ? resources : resources.filter((r) => r.kind === filter)),
    [filter]
  );

  const audioCount = resources.filter((r) => r.kind === "audio").length;
  const videoCount = resources.filter((r) => r.kind === "video").length;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold">Resources</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Downloadable audio and video for members — tap guides, breathing resets, and short
          workshop clips you can keep offline.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: `All (${resources.length})` },
            { id: "audio", label: `Audio (${audioCount})` },
            { id: "video", label: `Video (${videoCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              filter === tab.id
                ? "bg-[var(--navy)] text-white"
                : "bg-white text-[var(--muted)] ring-1 ring-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--navy)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {items.map((resource) => (
          <li key={resource.id} className="card overflow-hidden">
            <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={resource.kind === "audio" ? "badge badge-blue" : "badge badge-green"}>
                    {resource.kind}
                  </span>
                  <span className="badge">{resource.format}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {resource.duration} · {resource.sizeLabel}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-[var(--navy)]">{resource.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{resource.description}</p>

                <div className="mt-4">
                  {resource.kind === "audio" ? (
                    <audio controls preload="metadata" className="w-full max-w-xl" src={resource.href}>
                      Your browser does not support audio playback.
                    </audio>
                  ) : (
                    <video
                      controls
                      preload="metadata"
                      className="aspect-video w-full max-w-xl rounded-md bg-black"
                      src={resource.href}
                    >
                      Your browser does not support video playback.
                    </video>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <a href={resource.href} download={resource.fileName} className="btn-primary">
                  Download
                </a>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Open file
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted)]">No resources in this category yet.</p>
      )}
    </div>
  );
}
