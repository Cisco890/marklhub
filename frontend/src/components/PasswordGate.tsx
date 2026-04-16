import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/** Blocks main app until the user has changed the temporary password. */
export function PasswordGate() {
  const must = useAuthStore((s) => s.mustChangePassword);
  if (must) {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}
