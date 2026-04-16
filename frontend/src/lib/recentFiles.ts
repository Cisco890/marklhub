const STORAGE_KEY = 'markhub_recent_files_v1';
const MAX_ENTRIES = 25;

export type RecentFileEntry = {
  fileId: number;
  name: string;
  teamId: number;
  accessedAt: number;
};

function readAll(): RecentFileEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is RecentFileEntry =>
          typeof x === 'object' &&
          x !== null &&
          typeof (x as RecentFileEntry).fileId === 'number' &&
          typeof (x as RecentFileEntry).name === 'string' &&
          typeof (x as RecentFileEntry).teamId === 'number' &&
          typeof (x as RecentFileEntry).accessedAt === 'number',
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function touchRecentFile(entry: { fileId: number; name: string; teamId: number }): void {
  const list = readAll().filter((x) => x.fileId !== entry.fileId);
  list.unshift({ ...entry, accessedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

export function getRecentFilesForTeam(teamId: number): RecentFileEntry[] {
  return readAll().filter((x) => x.teamId === teamId);
}
