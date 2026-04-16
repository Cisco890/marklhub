import { useAuthStore } from '../stores/authStore';

const base = import.meta.env.VITE_API_URL ?? '';

type RequestConfig = {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config?: RequestConfig
): Promise<{ data: T }> {
  let url = `${base}/api${path}`;
  if (config?.params) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(config.params)) {
      if (value === undefined || value === null) continue;
      sp.set(key, String(value));
    }
    const q = sp.toString();
    if (q) url += `?${q}`;
  }

  const headers = new Headers(config?.headers);
  const token = useAuthStore.getState().token ?? localStorage.getItem('markhub_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let fetchBody: BodyInit | undefined;
  if (body instanceof FormData) {
    fetchBody = body;
  } else if (body !== undefined && body !== null) {
    headers.set('Content-Type', 'application/json');
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url, { method, headers, body: fetchBody });

  if (res.status === 401) {
    useAuthStore.getState().logout();
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const j = (await res.json()) as { message?: string };
      if (j?.message) message = j.message;
    } catch {
      /* ignore */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return { data: undefined as T };
  }

  const ct = res.headers.get('content-type');
  if (ct?.includes('application/json')) {
    const data = (await res.json()) as T;
    return { data };
  }

  return { data: undefined as T };
}

/**
 * Cliente HTTP con forma similar a Axios; implementado con {@link fetch}.
 */
export const api = {
  get: <T>(path: string, config?: RequestConfig) => request<T>('GET', path, undefined, config),

  post: <T>(path: string, data?: unknown, config?: RequestConfig) =>
    request<T>('POST', path, data, config),

  put: <T>(path: string, data?: unknown, config?: RequestConfig) =>
    request<T>('PUT', path, data, config),

  delete: (path: string, config?: RequestConfig) => request<void>('DELETE', path, undefined, config),
};
