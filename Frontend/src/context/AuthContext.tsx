import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  api,
  isUnauthorized,
  type TokenResponse,
  type UserMe,
  wakeApi,
  withWakeRetry,
} from '../api/client';

type AuthContextValue = {
  user: UserMe | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, meta?: Partial<TokenResponse>) => Promise<UserMe | null>;
  refreshUser: () => Promise<UserMe | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setUser(null);
      setToken(null);
      return null;
    }
    try {
      const data = await withWakeRetry(async () => {
        const { data } = await api.get<UserMe>('/api/auth/me');
        return data;
      });
      setUser(data);
      setToken(stored);
      return data;
    } catch (err) {
      if (isUnauthorized(err)) {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    void wakeApi();
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const setSession = useCallback(
    async (accessToken: string) => {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      return refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, setSession, refreshUser, logout }),
    [user, token, loading, setSession, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
