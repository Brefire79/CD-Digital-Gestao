import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { firebaseAuth, isFirebaseConfigured } from '../lib/firebase';

export interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthUser(firebaseUser: User): AuthUser {
  return { id: firebaseUser.uid, email: firebaseUser.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<AuthUser | null>(() => {
    return window.localStorage.getItem('cd_demo_auth') ? { id: 'demo-user', email: 'cabo.dia@quartel.local' } : null;
  });

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: user ?? demoUser,
    loading,
    demoMode: !isFirebaseConfigured,
    async signIn(email: string, password: string) {
      if (!firebaseAuth) {
        window.localStorage.setItem('cd_demo_auth', email || 'demo');
        setDemoUser({ id: 'demo-user', email: email || 'cabo.dia@quartel.local' });
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, email, password);
    },
    async signOut() {
      if (!firebaseAuth) {
        window.localStorage.removeItem('cd_demo_auth');
        setDemoUser(null);
        return;
      }
      await firebaseSignOut(firebaseAuth);
    }
  }), [demoUser, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
}
