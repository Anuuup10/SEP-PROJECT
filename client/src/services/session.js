const SESSION_KEY = 'nutrilens.session';
let session = { token: null, user: null };

const readStoredSession = () => {
  if (typeof window === 'undefined') return session;
  try {
    const stored = window.localStorage.getItem(SESSION_KEY);
    return stored ? { ...session, ...JSON.parse(stored) } : session;
  } catch {
    return session;
  }
};

session = readStoredSession();

export const getSession = () => session;
export const setSession = (token, user) => {
  session = { token, user };
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
export const clearSession = () => {
  session = { token: null, user: null };
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
};
export const getSessionToken = () => session.token;
