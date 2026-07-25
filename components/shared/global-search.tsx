"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchResults {
  missions: { id: string; slug: string; title: string }[];
  prompts: { id: string; title: string }[];
  paths: { id: string; slug: string; title: string }[];
  tools: { id: string; name: string }[];
}

const empty: SearchResults = { missions: [], prompts: [], paths: [], tools: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(empty);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(empty);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasResults =
    results.missions.length + results.prompts.length + results.paths.length + results.tools.length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <div className="flex items-center gap-2 rounded-lg border border-ivoire/15 bg-noir px-3 py-2">
        <Search size={16} className="text-ivoire-dim" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher missions, prompts, parcours, outils..."
          className="w-full bg-transparent text-sm text-ivoire outline-none placeholder:text-ivoire-dim"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(empty); }}>
            <X size={14} className="text-ivoire-dim" />
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-ivoire/10 bg-noir-soft p-2 shadow-xl">
          {!hasResults && (
            <p className="px-3 py-2 text-sm text-ivoire-dim">Aucun résultat.</p>
          )}

          {results.missions.length > 0 && (
            <ResultGroup label="Missions">
              {results.missions.map((m) => (
                <ResultItem key={m.id} label={m.title} onClick={() => { router.push(`/missions/${m.slug}`); setOpen(false); }} />
              ))}
            </ResultGroup>
          )}

          {results.paths.length > 0 && (
            <ResultGroup label="Parcours">
              {results.paths.map((p) => (
                <ResultItem key={p.id} label={p.title} onClick={() => { router.push(`/parcours/${p.slug}`); setOpen(false); }} />
              ))}
            </ResultGroup>
          )}

          {results.prompts.length > 0 && (
            <ResultGroup label="Prompts">
              {results.prompts.map((p) => (
                <ResultItem key={p.id} label={p.title} onClick={() => { router.push(`/prompts`); setOpen(false); }} />
              ))}
            </ResultGroup>
          )}

          {results.tools.length > 0 && (
            <ResultGroup label="Outils IA">
              {results.tools.map((t) => (
                <ResultItem key={t.id} label={t.name} onClick={() => { router.push(`/toolbox`); setOpen(false); }} />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1 text-xs uppercase tracking-wide text-ivoire-dim">{label}</p>
      {children}
    </div>
  );
}

function ResultItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-md px-3 py-2 text-left text-sm text-ivoire hover:bg-ivoire/5"
    >
      {label}
    </button>
  );
}
