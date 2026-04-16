import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFile, getFolder, getProject } from '../api/endpoints';
import { touchRecentFile } from '../lib/recentFiles';

export function MarkdownViewPage() {
  const { fileId: fileIdParam } = useParams();
  const fileId = Number(fileIdParam);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [folderId, setFolderId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(fileId)) navigate('/');
  }, [fileId, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const f = await getFile(fileId);
        setTitle(f.name);
        setBody(f.content);
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

  return (
    <div className="mx-auto max-w-4xl space-y-4">
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
        <span className="text-slate-200">Vista</span>
      </nav>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        <Link to={`/files/${fileId}/edit`} className="text-sm text-sky-400 hover:underline">
          Editar
        </Link>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <article className="prose prose-invert max-w-none prose-headings:text-slate-100 prose-a:text-sky-400 prose-pre:bg-slate-900">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </div>
  );
}
