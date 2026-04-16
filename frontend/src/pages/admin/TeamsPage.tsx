import { type FormEvent, useEffect, useState } from 'react';
import { createTeam, deleteTeam, listAllTeams, listTeamMembers } from '../../api/endpoints';
import type { Team, User } from '../../types/models';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [membersByTeam, setMembersByTeam] = useState<Record<number, User[]>>({});

  async function refresh() {
    const t = await listAllTeams();
    setTeams(t);
  }

  useEffect(() => {
    refresh().catch(() => setError('Error al cargar datos'));
  }, []);

  async function loadMembers(teamId: number) {
    try {
      const m = await listTeamMembers(teamId);
      setMembersByTeam((prev) => ({ ...prev, [teamId]: m }));
    } catch {
      setError('No se pudieron cargar los miembros del equipo');
    }
  }

  useEffect(() => {
    if (expanded != null) {
      loadMembers(expanded);
    }
  }, [expanded]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createTeam(name.trim(), description);
      setName('');
      setDescription('');
      await refresh();
    } catch {
      setError('No se pudo crear el equipo');
    }
  }

  async function onDeleteTeam(team: Team) {
    if (
      !window.confirm(
        `¿Eliminar el equipo "${team.name}"? Se borrarán todos sus proyectos, carpetas y archivos. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setError(null);
    try {
      await deleteTeam(team.id);
      if (expanded === team.id) setExpanded(null);
      await refresh();
    } catch {
      setError('No se pudo eliminar el equipo');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Equipos</h1>
      <p className="text-sm text-slate-500">
        Crea y elimina equipos. Los miembros se gestionan desde <strong className="text-slate-400">Usuarios</strong>{' '}
        (añadir o quitar usuarios de cada equipo).
      </p>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <form onSubmit={onCreate} className="space-y-3 rounded-lg border border-slate-800 p-4">
        <h2 className="text-sm font-medium text-slate-300">Nuevo equipo</h2>
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Nombre"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Descripción"
            className="min-w-[200px] flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white">
            Crear
          </button>
        </div>
      </form>
      <ul className="space-y-2">
        {teams.map((t) => (
          <li key={t.id} className="rounded-lg border border-slate-800 bg-slate-900/40">
            <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
              <button
                type="button"
                className="min-w-0 flex-1 text-left text-sm"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              >
                <span className="font-medium text-slate-100">{t.name}</span>
                <span className="ml-2 text-xs text-slate-500">id {t.id}</span>
              </button>
              <button
                type="button"
                className="flex-shrink-0 rounded-md border border-red-900/60 px-3 py-1 text-xs text-red-300 hover:bg-red-950/40"
                onClick={() => onDeleteTeam(t)}
              >
                Eliminar
              </button>
            </div>
            {expanded === t.id && (
              <div className="border-t border-slate-800 px-4 py-3 text-sm text-slate-400">
                <p className="mb-3">{t.description || 'Sin descripción'}</p>
                <div className="mt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">Miembros (solo lectura)</h3>
                  <ul className="space-y-1">
                    {(membersByTeam[t.id] ?? []).length === 0 ? (
                      <li className="text-xs text-slate-600">Ninguno aún. Asigna usuarios desde Usuarios.</li>
                    ) : (
                      (membersByTeam[t.id] ?? []).map((m) => (
                        <li key={m.id} className="rounded-md bg-slate-950/60 px-2 py-1 text-slate-200">
                          {m.username} <span className="text-slate-600">#{m.id}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
