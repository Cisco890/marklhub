import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchMe } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { useTeamStore } from '../stores/teamStore';

export function ProtectedRoute() {
  const location = useLocation();
  const { token, user, setUser, setMustChangePassword, hydrate: hydrateAuth } = useAuthStore();
  const hydrateTeam = useTeamStore((s) => s.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateAuth();
    hydrateTeam();
  }, [hydrateAuth, hydrateTeam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = useAuthStore.getState().token;
      if (!t) {
        setReady(true);
        return;
      }
      try {
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        setMustChangePassword(me.mustChangePassword);
      } catch {
        if (!cancelled) {
          useAuthStore.getState().logout();
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setUser, setMustChangePassword]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Cargando sesión…
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
