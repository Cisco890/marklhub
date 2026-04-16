import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Perfil</h1>
      <dl className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/40">
        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
          <dt className="text-slate-500">Usuario</dt>
          <dd className="col-span-2 text-slate-100">{user.username}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
          <dt className="text-slate-500">Rol</dt>
          <dd className="col-span-2 text-slate-100">{user.role}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
          <dt className="text-slate-500">Creado</dt>
          <dd className="col-span-2 text-slate-300">{new Date(user.createdAt).toLocaleString()}</dd>
        </div>
      </dl>
      <Link to="/change-password" className="text-sm text-sky-400 hover:underline">
        Cambiar contraseña
      </Link>
    </div>
  );
}
