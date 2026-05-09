import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { onAuthStateChange, getCurrentSession, signOut as authSignOut, type AuthSession } from '../../services/auth';

interface AuthContextValue {
  session: AuthSession | null; isLoading: boolean; isAuthenticated: boolean;
  signOut: () => Promise<void>; refreshSession: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue>({
  session: null, isLoading: true, isAuthenticated: false,
  signOut: async () => {}, refreshSession: async () => {},
});
export function useAuth(): AuthContextValue { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshSession = useCallback(async () => { setSession(await getCurrentSession()); }, []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const s = await getCurrentSession(); if (mounted) { setSession(s); setIsLoading(false); } }
      catch { if (mounted) { setSession(null); setIsLoading(false); } }
    })();
    const unsub = onAuthStateChange((s: AuthSession | null) => { if (mounted) { setSession(s); setIsLoading(false); } });
    return () => { mounted = false; unsub(); };
  }, []);
  const handleSignOut = useCallback(async () => { await authSignOut(); setSession(null); }, []);
  return <AuthContext.Provider value={{ session, isLoading, isAuthenticated: session !== null && session.user !== null, signOut: handleSignOut, refreshSession }}>{children}</AuthContext.Provider>;
}
