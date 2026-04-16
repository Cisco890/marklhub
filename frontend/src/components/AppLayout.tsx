import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const NAV_KEY = 'markhub_nav_open';

function readNavOpen(): boolean {
  try {
    return localStorage.getItem(NAV_KEY) !== '0';
  } catch {
    return true;
  }
}

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(readNavOpen);

  useEffect(() => {
    try {
      localStorage.setItem(NAV_KEY, navOpen ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [navOpen]);

  return (
    <div className="flex h-full">
      {navOpen && <Sidebar onCollapse={() => setNavOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar navOpen={navOpen} onOpenNav={() => setNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
