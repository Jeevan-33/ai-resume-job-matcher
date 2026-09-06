import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { clearToken, getToken, setToken } from './api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" only covers the initial token check, so protected routes don't
  // bounce you to /login before we've had a chance to validate the token.
  // Starting it at false when there is no token means there is nothing to wait for.
  const [loading, setLoading] = useState(() => !!getToken());

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Restore the session on a hard refresh
  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The api layer fires this when a request comes back 401 with a stale token
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const applySession = useCallback(async (data) => {
    setToken(data.access_token);
    if (data.user) {
      setUser(data.user);
      return data.user;
    }
    // Older backends only return the token; fall back to fetching the profile.
    const me = await api.get('/auth/me');
    setUser(me.data);
    return me.data;
  }, []);

  const signIn = useCallback(
    async (email, password) => {
      // FastAPI's OAuth2 login expects form data, not JSON
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);

      const res = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return applySession(res.data);
    },
    [applySession]
  );

  const register = useCallback(
    async ({ email, password, fullName }) => {
      const res = await api.post('/auth/register', {
        email,
        password,
        full_name: fullName || null,
      });
      // /auth/register returns a token too, so a new user lands signed in.
      return applySession(res.data);
    },
    [applySession]
  );

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: !!user, signIn, register, signOut }),
    [user, loading, signIn, register, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
