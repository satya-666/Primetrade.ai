const API_BASE = '/api/v1';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}

function getTokens() {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { accessToken } = getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data: ApiResponse<T>;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: `Server error (${res.status})`, errors: [] };
    }

    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getTokens().accessToken;
        headers['Authorization'] = `Bearer ${newToken}`;
        try {
          const retryRes = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          });
          return await retryRes.json();
        } catch {
          return { success: false, message: 'Server error on retry', errors: [] };
        }
      }
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return data;
  } catch {
    return { success: false, message: 'Network error', errors: [] };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const api = {
  getTokens,
  setTokens,
  clearTokens,

  auth: {
    register: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    refresh: () =>
      request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: getTokens().refreshToken }),
      }),
  },

  tasks: {
    list: () =>
      request<Array<{
        id: string;
        title: string;
        description: string;
        status: string;
        dueDate: string | null;
        ownerId: string;
        owner: { id: string; email: string };
        createdAt: string;
        updatedAt: string;
      }>>('/tasks'),
    create: (data: { title: string; description?: string; status?: string; dueDate?: string | null }) =>
      request<{
        id: string;
        title: string;
        description: string;
        status: string;
        dueDate: string | null;
        ownerId: string;
        createdAt: string;
        updatedAt: string;
      }>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { title?: string; description?: string; status?: string; dueDate?: string | null }) =>
      request<{
        id: string;
        title: string;
        description: string;
        status: string;
        dueDate: string | null;
        ownerId: string;
        createdAt: string;
        updatedAt: string;
      }>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/tasks/${id}`, { method: 'DELETE' }),
  },
};
