import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchFiles } from '../api/endpoints';
import type { MarkdownFileSummary } from '../types/models';
import { useTeamStore } from '../stores/teamStore';

export function FileSearchBar() {
  const teamId = useTeamStore((s) => s.activeTeamId);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<MarkdownFileSummary[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!teamId || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = window.setTimeout(() => {
      searchFiles(teamId, q.trim())
        .then(setResults)
        .catch(() => setResults([]));
    }, 250);
    return () => window.clearTimeout(t);
  }, [q, teamId]);

  if (!teamId) return null;

  return (
    <div className="relative min-w-[220px] max-w-md flex-1">
      <input
        type="search"
        placeholder="Buscar archivos por nombre…"
        value={q}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-700 bg-slate-900 shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <Link
                className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                to={`/files/${r.id}/edit`}
                onMouseDown={(e) => e.preventDefault()}
              >
                {r.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
