import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { getFile, getFolder, getProject, updateFile } from '../api/endpoints';
import { touchRecentFile } from '../lib/recentFiles';

export function MarkdownEditPage() {
  const { fileId: fileIdParam } = useParams();
  const fileId = Number(fileIdParam);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [folderId, setFolderId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Number.isNaN(fileId)) navigate('/');
  }, [fileId, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const f = await getFile(fileId);
        setName(f.name);
        setContent(f.content);
        setProjectId(f.projectId);
        setFolderId(f.folderId);
        const folder = await getFolder(f.folderId);
        setFolderName(folder.name);
        const p = await getProject(f.projectId);
        setTeamId(p.teamId);
        setProjectName(p.name);
        touchRecentFile({ fileId, name: f.name, teamId: p.teamId });
        setError(null);
      } catch {
        setError('No se pudo cargar el archivo.');
      }
    })();
  }, [fileId]);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      await updateFile(fileId, name.trim(), content);
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col gap-4">
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
              {projectName}
            </Link>
          </>
        )}
        {folderId != null && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/folders/${folderId}/files`} className="hover:text-sky-400">
              {folderName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-slate-200">Editar</span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <Link to={`/files/${fileId}/view`} className="text-sm text-slate-400 hover:text-slate-200">
          Vista previa
        </Link>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="min-h-0 flex-1" data-color-mode="dark">
        <MDEditor value={content} onChange={(v) => setContent(v ?? '')} height={480} />
      </div>
    </div>
  );
}
