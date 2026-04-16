import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { changePassword } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export function ChangePasswordPage() {
  const { token, user, mustChangePassword, setUser, setMustChangePassword, logout } = useAuthStore();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await changePassword(currentPassword, newPassword);
      setUser(u);
      setMustChangePassword(false);
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo cambiar la contraseña. Revisa la contraseña actual.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl"
      >
        <h1 className="text-lg font-semibold text-slate-50">
          {mustChangePassword ? 'Debes cambiar tu contraseña' : 'Cambiar contraseña'}
        </h1>
        {mustChangePassword && (
          <p className="text-sm text-slate-400">
            Tu cuenta usa una contraseña inicial. Elige una nueva para acceder al resto de la aplicación.
          </p>
        )}
        {error && <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div>
          <label className="mb-1 block text-xs text-slate-400">Contraseña actual</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Nueva contraseña (mín. 8 caracteres)</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Salir
          </button>
        </div>
      </form>
    </div>
  );
}
