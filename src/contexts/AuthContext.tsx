import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<User | null>(() => {
    return window.localStorage.getItem('cd_demo_auth') ? ({ id: 'demo-user', email: 'cabo.dia@quartel.local' } as User) : null;
  });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: user ?? demoUser,
    session,
    loading,
    demoMode: !isSupabaseConfigured,
    async signIn(email: string, password: string) {
      if (!supabase) {
        window.localStorage.setItem('cd_demo_auth', email || 'demo');
        setDemoUser({ id: 'demo-user', email: email || 'cabo.dia@quartel.local' } as User);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() {
      if (!supabase) {
        window.localStorage.removeItem('cd_demo_auth');
        setDemoUser(null);
        return;
      }
      await supabase.auth.signOut();
    }
  }), [demoUser, loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
