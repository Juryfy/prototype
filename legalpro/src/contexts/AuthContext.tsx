import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
  password: string; // SHA-256 hashed
}

/** Simple hash function using Web Crypto API */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Developer login: only juryfyai@gmail.com with Time@999
    if (email === 'juryfyai@gmail.com' && password === 'Time@999') {
      setUser({
        id: 'dev-admin',
        name: 'Juryfy Admin',
        email,
      });
      return true;
    }

    // Check registered users
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        const users = JSON.parse(stored) as StoredUser[];
        const hashedPassword = await hashPassword(password);
        const found = users.find(u => u.email === email && u.password === hashedPassword);
        if (found) {
          setUser({ id: found.id, name: found.name, email: found.email });
          return true;
        }
      }
    } catch { /* ignore */ }

    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    const hashedPassword = await hashPassword(password);
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword,
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
