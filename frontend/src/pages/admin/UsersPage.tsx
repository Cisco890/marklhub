import { type FormEvent, useEffect, useState } from 'react';
import {
  addTeamMember,
  createUser,
  deleteUser,
  listAllTeams,
  listUsers,
  removeTeamMember,
  updateUser,
} from '../../api/endpoints';
import { useAuthStore } from '../../stores/authStore';
import type { Team, UserWithTeams } from '../../types/models';

export function UsersPage() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [users, setUsers] = useState<UserWithTeams[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  /** userId -> teamId seleccionado para añadir */
  const [addToTeam, setAddToTeam] = useState<Record<number, number | ''>>({});

  async function refresh() {
    try {
      const [u, t] = await Promise.all([listUsers(), listAllTeams()]);
      setUsers(u);
      setAllTeams(t);
    } catch {
      setError('No se pudieron cargar los datos');
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createUser(username.trim(), role);
      setUsername('');
      await refresh();
    } catch {
      setError('No se pudo crear el usuario (¿nombre duplicado?)');
    }
  }

  async function onAddToTeam(user: UserWithTeams) {
    const teamId = addToTeam[user.id];
    if (teamId === '' || teamId === undefined) {
      setError('Elige un equipo');
      return;
    }
    const memberIds = new Set(user.teams.map((x) => x.id));
    if (memberIds.has(teamId)) {
      setError('El usuario ya está en ese equipo');
      return;
    }
    setError(null);
    try {
      await addTeamMember(teamId, user.id);
      setAddToTeam((prev) => ({ ...prev, [user.id]: '' }));
      await refresh();
    } catch {
      setError('No se pudo añadir al equipo');
    }
  }

  async function onRemoveFromTeam(teamId: number, userId: number) {
    if (!window.confirm('¿Quitar a este usuario del equipo?')) return;
    setError(null);
    try {
      await removeTeamMember(teamId, userId);
      await refresh();
    } catch {
      setError('No se pudo quitar del equipo');
    }
  }

  async function onDeleteUser(u: UserWithTeams) {
    if (u.id === currentUserId) {
      setError('No puedes eliminar tu propia cuenta');
      return;
    }
    if (
      !window.confirm(
        `¿Eliminar al usuario "${u.username}"? Los proyectos y archivos que creó pasarán a otro usuario del sistema.`
      )
    ) {
      return;
    }
    setError(null);
    try {
      await deleteUser(u.id);
      await refresh();
    } catch {
      setError('No se pudo eliminar el usuario');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Usuarios</h1>
      <p className="text-sm text-slate-500">
        Los usuarios nuevos reciben la contraseña inicial <code className="text-sky-300">password123</code> y deben
        cambiarla al iniciar sesión. Aquí ves todos los usuarios y los equipos a los que pertenecen; puedes añadirlos a
        un equipo sin ir a la pantalla de equipos.
      </p>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <form onSubmit={onCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-800 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Nombre de usuario</label>
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Rol</label>
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <button type="submit" className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-500">
          Crear
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Debe cambiar pwd</th>
              <th className="px-4 py-2">Equipos</th>
              <th className="px-4 py-2">Añadir a equipo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const memberIds = new Set(u.teams.map((t) => t.id));
              const availableTeams = allTeams.filter((t) => !memberIds.has(t.id));
              return (
                <tr key={u.id} className="border-t border-slate-800 align-top">
                  <td className="px-4 py-3 text-slate-200">{u.username}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                      value={u.role}
                      onChange={async (e) => {
                        const r = e.target.value as 'ADMIN' | 'USER';
                        try {
                          await updateUser(u.id, u.username, r);
                          await refresh();
                        } catch {
                          setError('No se pudo actualizar el rol');
                        }
                      }}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.mustChangePassword ? 'sí' : 'no'}</td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-md flex-wrap gap-1.5">
                      {u.teams.length === 0 ? (
                        <span className="text-xs text-slate-600">Ninguno</span>
                      ) : (
                        u.teams.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200"
                          >
                            {t.name}
                            <button
                              type="button"
                              className="text-slate-500 hover:text-red-400"
                              title="Quitar del equipo"
                              onClick={() => onRemoveFromTeam(t.id, u.id)}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="max-w-[200px] rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                        value={addToTeam[u.id] ?? ''}
                        onChange={(e) =>
                          setAddToTeam((prev) => ({
                            ...prev,
                            [u.id]: e.target.value === '' ? '' : Number(e.target.value),
                          }))
                        }
                      >
                        <option value="">Equipo…</option>
                        {availableTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rounded bg-sky-700 px-2 py-1 text-xs text-white hover:bg-sky-600 disabled:opacity-40"
                        disabled={availableTeams.length === 0}
                        onClick={() => onAddToTeam(u)}
                      >
                        Añadir
                      </button>
                    </div>
                    {allTeams.length === 0 && (
                      <p className="mt-1 text-xs text-amber-200/80">Crea equipos en la sección Equipos primero.</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={u.id === currentUserId || users.length <= 1}
                      title={
                        u.id === currentUserId
                          ? 'No puedes eliminarte a ti mismo'
                          : users.length <= 1
                            ? 'Debe existir al menos un usuario'
                            : 'Eliminar usuario'
                      }
                      className="rounded-md border border-red-900/50 px-2 py-1 text-xs text-red-300 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() => onDeleteUser(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
