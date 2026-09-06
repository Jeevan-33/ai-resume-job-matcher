import { createContext, useContext } from 'react';

// Kept apart from the provider so this module only exports plain values -
// mixing components and helpers in one file breaks React Fast Refresh.
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
}
