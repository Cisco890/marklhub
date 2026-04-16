export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  username: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Usuario con equipos (respuesta admin). */
export interface TeamBrief {
  id: number;
  name: string;
}

export interface UserWithTeams extends User {
  teams: TeamBrief[];
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  teamId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: number;
  name: string;
  projectId: number;
  parentFolderId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarkdownFile {
  id: number;
  name: string;
  projectId: number;
  folderId: number;
  content: string;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarkdownFileSummary {
  id: number;
  name: string;
  projectId: number;
  folderId: number;
  createdBy: number;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  mustChangePassword: boolean;
}
