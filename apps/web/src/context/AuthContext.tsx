import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@webuild/shared";
import { api } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/storage";

interface AuthContextValue {
  user: AuthUser | null;
  initializing: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  signup: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const currentUser = await api.getMe();
        if (active) setUser(currentUser);
      } catch {
        clearToken();
      } finally {
        if (active) setInitializing(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await api.login(input);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const signup = useCallback(async (input: RegisterInput) => {
    const response = await api.register(input);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    const currentUser = await api.getMe();
    setUser(currentUser);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, signup, logout, refreshUser }),
    [user, initializing, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
