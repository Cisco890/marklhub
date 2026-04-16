import { FileSearchBar } from './FileSearchBar';
import { TeamSelector } from './TeamSelector';

type Props = {
  navOpen: boolean;
  onOpenNav: () => void;
};

export function Topbar({ navOpen, onOpenNav }: Props) {
  return (
    <header className="flex items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur">
      {!navOpen && (
        <button
          type="button"
          title="Mostrar menú"
          onClick={onOpenNav}
          className="flex-shrink-0 rounded-md border border-slate-700 px-2.5 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          ☰ Menú
        </button>
      )}
      <TeamSelector />
      <FileSearchBar />
    </header>
  );
}
