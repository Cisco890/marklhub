import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createFolder, deleteFolder, getProject, listFolders, updateFolder } from '../api/endpoints';
import type { Folder } from '../types/models';

export function FoldersPage() {
  const { projectId: projectIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const navigate = useNavigate();

  const [teamId, setTeamId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<number | ''>('');
  const [editing, setEditing] = useState<Folder | null>(null);

  useEffect(() => {
    if (Number.isNaN(projectId)) {
      navigate('/');
    }
  }, [projectId, navigate]);

  async function refresh() {
    try {
      const p = await getProject(projectId);
      setTeamId(p.teamId);
      setProjectName(p.name);
      const list = await listFolders(projectId);
      setFolders(list);
      setError(null);
    } catch {
      setError('No se pudieron cargar las carpetas o no tienes acceso.');
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createFolder(projectId, name.trim(), parentFolderId === '' ? null : Number(parentFolderId));
      setName('');
      setParentFolderId('');
      await refresh();
    } catch {
      setError('No se pudo crear la carpeta');
    }
  }

  async function onUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    try {
      await updateFolder(
        editing.id,
        editing.name.trim(),
        editing.parentFolderId ?? null
      );
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
        {teamId != null && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/teams/${teamId}/projects`} className="hover:text-sky-400">
              Proyectos
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-200">{projectName || 'Proyecto'}</span>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Carpetas</span>
      </nav>
      <h1 className="text-xl font-semibold">Carpetas</h1>
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
          <label className="mb-1 block text-xs text-slate-500">Subcarpeta de (opcional)</label>
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={parentFolderId}
            onChange={(e) => setParentFolderId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">— Raíz —</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white">
          Nueva carpeta
        </button>
      </form>
      <ul className="space-y-2">
        {folders.map((f) => (
          <li
            key={f.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
          >
            <div>
              <Link className="font-medium text-sky-300 hover:underline" to={`/folders/${f.id}/files`}>
                {f.name}
              </Link>
              {f.parentFolderId != null && (
                <span className="ml-2 text-xs text-slate-600">(subcarpeta)</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200"
                onClick={() => setEditing({ ...f })}
              >
                Editar
              </button>
              <button
                type="button"
                className="text-xs text-red-400 hover:text-red-300"
                onClick={() => {
                  if (window.confirm('¿Eliminar esta carpeta y los archivos que contiene?')) {
                    deleteFolder(f.id).then(refresh).catch(() => setError('No se pudo eliminar'));
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
            <h2 className="text-lg font-medium">Editar carpeta</h2>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              value={editing.parentFolderId ?? ''}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  parentFolderId: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            >
              <option value="">— Raíz —</option>
              {folders
                .filter((x) => x.id !== editing.id)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
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
