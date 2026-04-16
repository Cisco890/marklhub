import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProject, deleteProject, listProjects, updateProject } from '../api/endpoints';
import type { Project } from '../types/models';
import { useTeamStore } from '../stores/teamStore';

export function ProjectsPage() {
  const { teamId: teamIdParam } = useParams();
  const teamId = Number(teamIdParam);
  const navigate = useNavigate();
  const setActiveTeamId = useTeamStore((s) => s.setActiveTeamId);

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState<Project | null>(null);

  useEffect(() => {
    if (Number.isNaN(teamId)) {
      navigate('/');
      return;
    }
    setActiveTeamId(teamId);
  }, [teamId, navigate, setActiveTeamId]);

  async function refresh() {
    try {
      setProjects(await listProjects(teamId));
    } catch {
      setError('No tienes acceso a este equipo o no existe.');
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createProject(teamId, name.trim(), description);
      setName('');
      setDescription('');
      await refresh();
    } catch {
      setError('No se pudo crear el proyecto');
    }
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateProject(editing.id, editing.name.trim(), editing.description ?? '');
      setEditing(null);
      await refresh();
    } catch {
      setError('No se pudo actualizar');
    }
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to="/" className="hover:text-sky-400">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Equipo {teamId}</span>
        <span className="mx-2">/</span>
        <span className="text-slate-200">Proyectos</span>
      </nav>
      <h1 className="text-xl font-semibold">Proyectos</h1>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-800 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Nombre</label>
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Descripción</label>
          <input
            className="min-w-[200px] rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white">
          Nuevo proyecto
        </button>
      </form>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
          >
            <div>
              <Link className="font-medium text-sky-300 hover:underline" to={`/projects/${p.id}/folders`}>
                {p.name}
              </Link>
              {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={() => setEditing({ ...p })}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => {
                  if (window.confirm('¿Eliminar este proyecto y todo su contenido?')) {
                    deleteProject(p.id).then(refresh).catch(() => setError('No se pudo eliminar'));
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={onUpdate} className="w-full max-w-md space-y-3 rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-medium">Editar proyecto</h2>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <textarea
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              rows={3}
              value={editing.description ?? ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded-md px-3 py-2 text-sm text-slate-400" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
