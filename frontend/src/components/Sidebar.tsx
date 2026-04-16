import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-800 text-sky-300' : 'text-slate-300 hover:bg-slate-800/80'
  }`;

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type Props = {
  onCollapse: () => void;
};

export function Sidebar({ onCollapse }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-slate-800 bg-slate-900/60">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3 py-3">
        <NavLink
          to="/profile"
          title="Perfil"
          className={({ isActive }) =>
            `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
              isActive
                ? 'border-sky-500 bg-sky-950/50 text-sky-300'
                : 'border-slate-600 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <span className="sr-only">Ir a perfil</span>
          <PersonIcon className="h-6 w-6" aria-hidden />
        </NavLink>
        <button
          type="button"
          title="Ocultar menú"
          onClick={onCollapse}
          className="flex-shrink-0 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          «
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 border-t border-slate-800/80 p-3">
        <NavLink to="/" end className={linkClass}>
          Inicio
        </NavLink>
        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-3 text-xs font-semibold uppercase text-slate-500">Admin</div>
            <NavLink to="/admin/users" className={linkClass}>
              Usuarios
            </NavLink>
            <NavLink to="/admin/teams" className={linkClass}>
              Equipos
            </NavLink>
          </>
        )}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-900/55 hover:text-white"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
