"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useDataStore } from "@/lib/data-store";

function SearchResults() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const { search } = useDataStore();
  const [query, setQuery] = useState(initial);

  const results = useMemo(() => search(query), [search, query]);

  function hrefFor(type: string, id: string) {
    switch (type) {
      case "news":
        return `/news/${id}`;
      case "discussion":
        return `/discussions/${id}`;
      case "event":
        return `/events/${id}`;
      case "member":
        return `/members/${id}`;
      default:
        return "/";
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-semibold">Search</h1>
        <p className="mt-2 text-[var(--muted)]">
          Search news, discussions, events and members in this demo.
        </p>
      </div>

      <form
        className="card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const url = new URL(window.location.href);
          url.searchParams.set("q", query);
          window.history.replaceState({}, "", url.toString());
        }}
      >
        <label className="label" htmlFor="search-q">Search</label>
        <input
          id="search-q"
          className="field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “summer”, “Sarah”, or “AGM”"
          autoFocus
        />
      </form>

      <p className="text-sm text-[var(--muted)]">
        {query.trim()
          ? `${results.length} result${results.length === 1 ? "" : "s"}`
          : "Type to search"}
      </p>

      <ul className="space-y-3">
        {results.map((result) => (
          <li key={`${result.type}-${result.id}`}>
            <Link
              href={hrefFor(result.type, result.id)}
              className="card block p-4 transition hover:border-[var(--blue)]"
            >
              <span className="badge badge-blue">{result.type}</span>
              <h2 className="mt-2 text-lg font-semibold text-[var(--navy)]">{result.title}</h2>
              {result.subtitle && (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{result.subtitle}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">Loading search…</div>}>
      <SearchResults />
    </Suspense>
  );
}
