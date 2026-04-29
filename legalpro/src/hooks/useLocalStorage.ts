import { useState, useCallback } from 'react';

export function useLocalStorage<T extends { id: string }>(key: string, initialValue: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T[];
      }
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const persist = useCallback((next: T[]) => {
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, [key]);

  const add = useCallback((item: T) => {
    persist([...items, item]);
  }, [items, persist]);

  const update = useCallback((id: string, updates: Partial<T>) => {
    persist(items.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [items, persist]);

  const remove = useCallback((id: string) => {
    persist(items.filter(item => item.id !== id));
  }, [items, persist]);

  const set = useCallback((next: T[]) => {
    persist(next);
  }, [persist]);

  return [items, { add, update, remove, set }] as const;
}
