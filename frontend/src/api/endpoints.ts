import type {
  Folder,
  LoginResponse,
  MarkdownFile,
  MarkdownFileSummary,
  Project,
  Team,
  User,
  UserWithTeams,
} from '../types/models';
import { api } from './client';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { username, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<User> {
  const { data } = await api.post<User>('/auth/change-password', { currentPassword, newPassword });
  return data;
}

export async function listUsers(): Promise<UserWithTeams[]> {
  const { data } = await api.get<UserWithTeams[]>('/users');
  return data;
}

/** Todos los equipos (solo administración). */
export async function listAllTeams(): Promise<Team[]> {
  const { data } = await api.get<Team[]>('/teams/all');
  return data;
}

export async function createUser(username: string, role: 'ADMIN' | 'USER'): Promise<User> {
  const { data } = await api.post<User>('/users', { username, role });
  return data;
}

export async function updateUser(id: number, username: string, role?: 'ADMIN' | 'USER'): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, { username, role: role ?? null });
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

export async function listMyTeams(): Promise<Team[]> {
  const { data } = await api.get<Team[]>('/teams/my');
  return data;
}

export async function createTeam(name: string, description: string): Promise<Team> {
  const { data } = await api.post<Team>('/teams', { name, description });
  return data;
}

export async function getTeam(teamId: number): Promise<Team> {
  const { data } = await api.get<Team>(`/teams/${teamId}`);
  return data;
}

export async function addTeamMember(teamId: number, userId: number): Promise<void> {
  await api.post(`/teams/${teamId}/members/${userId}`);
}

export async function removeTeamMember(teamId: number, userId: number): Promise<void> {
  await api.delete(`/teams/${teamId}/members/${userId}`);
}

export async function deleteTeam(teamId: number): Promise<void> {
  await api.delete(`/teams/${teamId}`);
}

export async function listTeamMembers(teamId: number): Promise<User[]> {
  const { data } = await api.get<User[]>(`/teams/${teamId}/members`);
  return data;
}

export async function getProject(projectId: number): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${projectId}`);
  return data;
}

export async function listProjects(teamId: number): Promise<Project[]> {
  const { data } = await api.get<Project[]>(`/teams/${teamId}/projects`);
  return data;
}

export async function createProject(teamId: number, name: string, description: string): Promise<Project> {
  const { data } = await api.post<Project>(`/teams/${teamId}/projects`, { name, description });
  return data;
}

export async function updateProject(projectId: number, name: string, description: string): Promise<Project> {
  const { data } = await api.put<Project>(`/projects/${projectId}`, { name, description });
  return data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

export async function getFolder(folderId: number): Promise<Folder> {
  const { data } = await api.get<Folder>(`/folders/${folderId}`);
  return data;
}

export async function listFolders(projectId: number): Promise<Folder[]> {
  const { data } = await api.get<Folder[]>(`/projects/${projectId}/folders`);
  return data;
}

export async function createFolder(projectId: number, name: string, parentFolderId: number | null): Promise<Folder> {
  const { data } = await api.post<Folder>(`/projects/${projectId}/folders`, { name, parentFolderId });
  return data;
}

export async function updateFolder(folderId: number, name: string, parentFolderId: number | null): Promise<Folder> {
  const { data } = await api.put<Folder>(`/folders/${folderId}`, { name, parentFolderId });
  return data;
}

export async function deleteFolder(folderId: number): Promise<void> {
  await api.delete(`/folders/${folderId}`);
}

export async function listFiles(folderId: number): Promise<MarkdownFile[]> {
  const { data } = await api.get<MarkdownFile[]>(`/folders/${folderId}/files`);
  return data;
}

export async function createFile(folderId: number, name: string, content: string): Promise<MarkdownFile> {
  const { data } = await api.post<MarkdownFile>(`/folders/${folderId}/files`, { name, content });
  return data;
}

export async function uploadFile(folderId: number, file: File): Promise<MarkdownFile> {
  const body = new FormData();
  body.append('file', file);
  const { data } = await api.post<MarkdownFile>(`/folders/${folderId}/files/upload`, body);
  return data;
}

export async function getFile(fileId: number): Promise<MarkdownFile> {
  const { data } = await api.get<MarkdownFile>(`/files/${fileId}`);
  return data;
}

export async function updateFile(fileId: number, name: string, content: string): Promise<MarkdownFile> {
  const { data } = await api.put<MarkdownFile>(`/files/${fileId}`, { name, content });
  return data;
}

export async function deleteFile(fileId: number): Promise<void> {
  await api.delete(`/files/${fileId}`);
}

export async function searchFiles(teamId: number, name: string): Promise<MarkdownFileSummary[]> {
  const { data } = await api.get<MarkdownFileSummary[]>(`/teams/${teamId}/files/search`, {
    params: { name },
  });
  return data;
}
