import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from './constants';
import toast from 'react-hot-toast';

// Helper functions for cookie management (for cross-subdomain auth in production)
function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  // Set domain to parent domain for cross-subdomain access in production
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? '.drabeldamina.org' : '';
  const domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${domainStr}; SameSite=Lax; Secure`;
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = isProduction ? '.drabeldamina.org' : '';
  const domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
}

export function saveTokens({ accessToken, refreshToken }) {
  // In production, use cookies for cross-subdomain auth
  // In development, use localStorage
  const isProduction = process.env.NODE_ENV === 'production';

  if (accessToken) {
    if (isProduction) {
      setCookie(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
  }

  if (refreshToken) {
    if (isProduction) {
      setCookie(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
}

export function loadTokens() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      accessToken: getCookie(ACCESS_TOKEN_KEY) || null,
      refreshToken: getCookie(REFRESH_TOKEN_KEY) || null,
    };
  } else {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
    };
  }
}

export function clearTokens() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function saveUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function clearAuth() {
  clearTokens();
  clearUser();
}

export const notify = {
  success: (msg, opts) => toast.success(msg, { id: msg, ...opts }),
  error: (msg, opts) => toast.error(msg, { id: msg, ...opts }),
  info: (msg, opts) => toast(msg, { id: msg, ...opts }),
  dismiss: () => toast.dismiss(),
};

export function formatBackendErrorMessage(payloadOrString) {
  const raw = typeof payloadOrString === 'string'
    ? payloadOrString
    : (payloadOrString?.error || payloadOrString?.message || 'Request failed');
  if (!raw) return 'Request failed';
  const s = String(raw).trim();
  if (s.startsWith('{') && s.endsWith('}')) {
    // Parse map-like: {field=message, field2=message2}
    const inner = s.slice(1, -1);
    const parts = inner.split(/,\s*/);
    const friendly = parts.map(p => {
      const [k, v] = p.split(/=\s*/);
      return k && v ? `${k}: ${v}` : p;
    }).join('\n');
    return friendly;
  }
  return s;
}


