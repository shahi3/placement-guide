// One place that knows where each login's token is stored.
// Students: localStorage (survives browser restarts). Admins: sessionStorage (cleared on tab close).
const STORES = {
  student: { storage: () => localStorage, key: 'placement_user_token', loginPath: '/student-login' },
  admin: { storage: () => sessionStorage, key: 'admin_token', loginPath: '/admin-login' },
};

export const getToken = (role) => STORES[role].storage().getItem(STORES[role].key);
export const setToken = (role, token) => STORES[role].storage().setItem(STORES[role].key, token);
export const loginPathFor = (role) => STORES[role].loginPath;

export const clearSession = (role) => {
  STORES[role].storage().removeItem(STORES[role].key);
  if (role === 'student') localStorage.removeItem('placement_user');
};

// Read the (unverified) payload of a JWT. The server still verifies every request;
// this is only used to decide which page to show.
const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

// True only if a token exists, belongs to this role, and has not expired
export const hasValidSession = (role) => {
  const token = getToken(role);
  const payload = token && decodeToken(token);
  return Boolean(payload && payload.role === role && payload.exp * 1000 > Date.now());
};
