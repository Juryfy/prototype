import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AUTH_KEY = 'juryfy_auth';
const USERS_KEY = 'juryfy_registered_users';

const AuthContext = createContext<AuthContextType | null>(null);

interface StoredAuth {
  user: User;
  isAuthenticated: boolean;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredAuth;
        return parsed.isAuthenticated ? parsed.user : null;
      }
    } catch { /* ignore */ }
    return null;
  });

  const isAuthenticated = user !== null;

  useEffect(() => {
    const auth: StoredAuth = { user: user!, isAuthenticated };
    if (isAuthenticated) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user, isAuthenticated]);

  const login = useCallback((email: string, password: string): boolean => {
    // Check registered users first
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        const users = JSON.parse(stored) as StoredUser[];
        const found = users.find(u => u.email === email && u.password === password);
        if (found) {
          setUser({ id: found.id, name: found.name, email: found.email });
          return true;
        }
      }
    } catch { /* ignore */ }

    // Prototype fallback: accept any email with password "demo123"
    if (password === 'demo123') {
      setUser({
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
      });
      return true;
    }

    return false;
  }, []);

  const register = useCallback((name: string, email: string, password: string): void => {
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
    };

    // Store in registered users list
    let users: StoredUser[] = [];
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) users = JSON.parse(stored) as StoredUser[];
    } catch { /* ignore */ }
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto-login after registration
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
