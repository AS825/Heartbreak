import type { StateStorage } from 'zustand/middleware';

/**
 * Einzige Stelle, an der Daten gespeichert werden.
 * Heute: localStorage. Später: ein FirestoreAdapter mit derselben Schnittstelle.
 */
export interface StorageAdapter extends StateStorage {
  readonly name: string;
}

export const localStorageAdapter: StorageAdapter = {
  name: 'local',
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Speicher voll oder blockiert – der Draft läuft trotzdem weiter. */
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignorieren */
    }
  },
};
