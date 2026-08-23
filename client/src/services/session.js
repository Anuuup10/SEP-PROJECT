let session = { token: null, user: null };
export const getSession = () => session;
export const setSession = (token, user) => { session = { token, user }; };
export const clearSession = () => { session = { token: null, user: null }; };
export const getSessionToken = () => session.token;
