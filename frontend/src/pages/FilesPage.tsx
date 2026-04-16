import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createFile, deleteFile, getFolder, getProject, listFiles, uploadFile } from '../api/endpoints';
import type { MarkdownFile } from '../types/models';

export function FilesPage() {
  const { folderId: folderIdParam } = useParams();
  const folderId = Number(folderIdParam);
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('# Nuevo archivo\n');

  useEffect(() => {
    if (Number.isNaN(folderId)) navigate('/');
  }, [folderId, navigate]);

  async function refresh() {
    const list = await listFiles(folderId);
    setFiles(list);
  }

  useEffect(() => {
    (async () => {
      try {
        const folder = await getFolder(folderId);
        setProjectId(folder.projectId);
        setFolderName(folder.name);
        const p = await getProject(folder.projectId);
        setTeamId(p.teamId);
        setProjectName(p.name);
        await refresh();
        setError(null);
      } catch {
        setError('Carpeta no encontrada o sin acceso.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const f = await createFile(folderId, name.trim(), content);
      setName('');
      setContent('# Nuevo archivo\n');
      navigate(`/files/${f.id}/edit`);
    } catch {
      setError('No se pudo crear el archivo');
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const f = await uploadFile(folderId, file);
      e.target.value = '';
      navigate(`/files/${f.id}/edit`);
    } catch {
      setError('Solo se permiten archivos .md de hasta 2MB.');
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
        {projectId != null && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/projects/${projectId}/folders`} className="hover:text-sky-400">
              {projectName || 'Proyecto'}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-200">{folderName || 'Carpeta'}</span>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Archivos</span>
      </nav>
      <h1 className="text-xl font-semibold">Archivos Markdown</h1>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-800 p-4">
        <form onSubmit={onCreate} className="flex min-w-[240px] flex-1 flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-300">Crear vacío</h2>
          <input
            placeholder="nombre.md"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="min-h-[100px] rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit" className="rounded-md bg-sky-600 py-2 text-sm text-white">
            Crear y editar
          </button>
        </form>
        <div className="flex min-w-[200px] flex-1 flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-300">Subir .md</h2>
          <input type="file" accept=".md,text/markdown" onChange={onUpload} className="text-sm text-slate-400" />
        </div>
      </div>
      <ul className="space-y-2">
        {files.map((f) => (
          <li
            key={f.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
          >
            <div className="flex flex-wrap gap-3">
              <Link className="font-medium text-sky-300 hover:underline" to={`/files/${f.id}/edit`}>
                {f.name}
              </Link>
              <Link className="text-xs text-slate-500 hover:text-slate-300" to={`/files/${f.id}/view`}>
                Vista
              </Link>
            </div>
            <button
              type="button"
              className="text-xs text-red-400 hover:text-red-300"
              onClick={() => {
                if (window.confirm('¿Eliminar este archivo?')) {
                  deleteFile(f.id)
                    .then(refresh)
                    .catch(() => setError('No se pudo eliminar'));
                }
              }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
