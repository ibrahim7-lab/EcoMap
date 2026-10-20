
const API_BASE = 'http://localhost:5000/api';

// General API helper. Keeps admin and user sessions separate.
export async function api(url, options = {}) {
  const headers = { ...(options.headers || {}) };

  // Normalize API paths and select the correct session token.
  const path = url.startsWith('http')
    ? new URL(url).pathname
    : url;

  const isUserRequest = path.startsWith('/users/');
  const token = isUserRequest
    ? localStorage.getItem('userToken')
    : localStorage.getItem('token');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestUrl = url.startsWith('http')
    ? url
    : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;

  const res = await fetch(requestUrl, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// User account helpers
export async function registerUser(details) {
  const data = await api('/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });

  localStorage.setItem('userToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

export async function loginUser(credentials) {
  const data = await api('/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  localStorage.setItem('userToken', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));

  return data;
}

export function logoutUser() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('user');
}
