import { useState, useEffect, useCallback } from 'react';
import { CSVImportSession } from '../types';
import { csvImportService } from '../firebaseService';

export const useCSVImportSessions = (userId: string | null) => {
  const [importSessions, setImportSessions] = useState<CSVImportSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load import sessions
  useEffect(() => {
    if (!userId) {
      setImportSessions([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const loadImportSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Subscribe to real-time updates
        unsubscribe = csvImportService.subscribeToImportSessions(userId, (sessions) => {
          setImportSessions(sessions);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error loading CSV import sessions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load import sessions');
        setLoading(false);
      }
    };

    loadImportSessions();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const saveImportSession = useCallback(async (importSession: Omit<CSVImportSession, 'id'>) => {
    if (!userId) return null;
    try {
      const id = await csvImportService.saveImportSession(importSession, userId);
      return id;
    } catch (err) {
      console.error('Error saving CSV import session:', err);
      setError(err instanceof Error ? err.message : 'Failed to save import session');
      throw err;
    }
  }, [userId]);

  const updateImportSession = useCallback(async (id: string, updates: Partial<CSVImportSession>) => {
    if (!userId) return;
    try {
      await csvImportService.updateImportSession(id, updates, userId);
    } catch (err) {
      console.error('Error updating CSV import session:', err);
      setError(err instanceof Error ? err.message : 'Failed to update import session');
      throw err;
    }
  }, [userId]);

  const deleteImportSession = useCallback(async (id: string) => {
    try {
      await csvImportService.deleteImportSession(id);
    } catch (err) {
      console.error('Error deleting CSV import session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete import session');
      throw err;
    }
  }, []);

  const getImportSession = useCallback(async (id: string) => {
    try {
      return await csvImportService.getImportSession(id);
    } catch (err) {
      console.error('Error getting CSV import session:', err);
      setError(err instanceof Error ? err.message : 'Failed to get import session');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    importSessions,
    loading,
    error,
    saveImportSession,
    updateImportSession,
    deleteImportSession,
    getImportSession,
    clearError
  };
};
