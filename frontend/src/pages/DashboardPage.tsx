import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listFolders, listProjects } from '../api/endpoints';
import { getRecentFilesForTeam } from '../lib/recentFiles';
import type { Folder, Project } from '../types/models';
import { useTeamStore } from '../stores/teamStore';

type FolderRow = Folder & { projectName: string };

function flattenAndSort(projects: Project[], foldersByProject: Map<number, Folder[]>): FolderRow[] {
  const rows: FolderRow[] = [];
  for (const p of projects) {
    const folders = foldersByProject.get(p.id) ?? [];
    for (const f of folders) {
      rows.push({ ...f, projectName: p.name });
    }
  }
  rows.sort((a, b) => {
    const c = a.projectName.localeCompare(b.projectName, 'es', { sensitivity: 'base' });
    if (c !== 0) return c;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });
  return rows;
}

export function DashboardPage() {
  const teamId = useTeamStore((s) => s.activeTeamId);
  const [folderRows, setFolderRows] = useState<FolderRow[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [foldersError, setFoldersError] = useState<string | null>(null);

  useEffect(() => {
    if (teamId == null) {
      setFolderRows([]);
      setFoldersError(null);
      return;
    }

    const id = teamId;
    let cancelled = false;

    async function load() {
      setLoadingFolders(true);
      setFoldersError(null);
      try {
        const projects = await listProjects(id);
        if (cancelled) return;

        const pairs = await Promise.all(
          projects.map(async (project) => {
            const folders = await listFolders(project.id);
            return { project, folders } as const;
          }),
        );
        if (cancelled) return;

        const map = new Map<number, Folder[]>();
        for (const { project, folders } of pairs) {
          map.set(project.id, folders);
        }
        const rows = flattenAndSort(
          pairs.map((p) => p.project),
          map,
        );
        setFolderRows(rows);
      } catch {
        if (!cancelled) {
          setFoldersError('No se pudieron cargar las carpetas del equipo.');
          setFolderRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingFolders(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const recentFiles = teamId != null ? getRecentFilesForTeam(teamId) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Bienvenido</h1>
        <p className="mt-2 text-slate-400">
          Selecciona un equipo en la barra superior y trabaja en proyectos, carpetas y archivos Markdown.
        </p>
      </div>

      {!teamId ? (
        <p className="text-sm text-amber-200/90">
          Aún no tienes un equipo seleccionable. Pide acceso a un administrador.
        </p>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-slate-200">Carpetas del equipo</h2>
              <Link
                to={`/teams/${teamId}/projects`}
                className="text-sm font-medium text-sky-400 hover:text-sky-300"
              >
                Proyectos
              </Link>
            </div>

            {loadingFolders ? (
              <p className="text-sm text-slate-500">Cargando carpetas…</p>
            ) : foldersError ? (
              <p className="text-sm text-red-300">{foldersError}</p>
            ) : folderRows.length === 0 ? (
              <p className="text-sm text-slate-400">
                Aún no hay carpetas en este equipo. Créalas desde un proyecto.
              </p>
            ) : (
              <ul className="space-y-2">
                {folderRows.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
                  >
                    <Link
                      className="font-medium text-sky-300 hover:underline"
                      to={`/folders/${f.id}/files`}
                    >
                      {f.name}
                    </Link>
                    {f.parentFolderId != null && (
                      <span className="ml-2 text-xs text-slate-600">(subcarpeta)</span>
                    )}
                    <p className="mt-0.5 text-xs text-slate-500">{f.projectName}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 border-t border-slate-800 pt-8">
            <h2 className="text-lg font-medium text-slate-200">Recientes</h2>
            {recentFiles.length === 0 ? (
              <p className="text-sm text-slate-400">
                Los archivos Markdown que abras o edites aparecerán aquí.
              </p>
            ) : (
              <ul className="space-y-2">
                {recentFiles.map((r) => (
                  <li
                    key={r.fileId}
                    className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
                  >
                    <Link
                      className="font-medium text-sky-300 hover:underline"
                      to={`/files/${r.fileId}/edit`}
                    >
                      {r.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(r.accessedAt).toLocaleString('es', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
