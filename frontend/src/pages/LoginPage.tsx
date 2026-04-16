import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { login } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Pick<Location, 'pathname'> } | null)?.from?.pathname ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (!res || typeof res.token !== 'string' || !res.token) {
        throw new Error('Respuesta inválida del servidor en /api/auth/login');
      }
      setSession(res.token, res.user, res.mustChangePassword);
      navigate(res.mustChangePassword ? '/change-password' : from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (!message || message === 'Failed to fetch') {
        setError('No se pudo conectar con el servidor');
      } else if (message.toLowerCase().includes('invalid credentials')) {
        setError('Credenciales inválidas');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl"
      >
        <h1 className="text-center text-xl font-semibold text-slate-50">MarkHub</h1>
        <p className="text-center text-sm text-slate-500">Inicia sesión para continuar</p>
        {error && <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-200">{error}</p>}
        <div>
          <label className="mb-1 block text-xs text-slate-400">Usuario</label>
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Contraseña</label>
          <input
            type="password"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
