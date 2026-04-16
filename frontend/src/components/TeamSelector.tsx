import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listMyTeams } from '../api/endpoints';
import type { Team } from '../types/models';
import { useTeamStore } from '../stores/teamStore';

export function TeamSelector() {
  const [teams, setTeams] = useState<Team[]>([]);
  const activeTeamId = useTeamStore((s) => s.activeTeamId);
  const setActiveTeamId = useTeamStore((s) => s.setActiveTeamId);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await listMyTeams();
        if (cancelled) return;
        setTeams(t);
        if (t.length === 0) {
          setActiveTeamId(null);
          return;
        }
        const cur = useTeamStore.getState().activeTeamId;
        const ok = cur != null && t.some((x) => x.id === cur);
        if (!ok) {
          setActiveTeamId(t[0].id);
        }
      } catch {
        if (!cancelled) setTeams([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setActiveTeamId]);

  if (teams.length === 0) {
    return (
      <div className="text-xs text-slate-500">
        Sin equipos. Un administrador debe añadirte a un equipo.
      </div>
    );
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Equipo</span>
      <select
        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
        value={activeTeamId ?? teams[0].id}
        onChange={(e) => {
          const id = Number(e.target.value);
          setActiveTeamId(id);
          navigate(`/teams/${id}/projects`);
        }}
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
