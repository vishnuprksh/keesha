import { useState, useEffect, useCallback } from 'react';
import { CSVRow } from '../types';

interface CSVImportState {
  csvData: CSVRow[];
  selectedFile: {
    name: string;
    size: number;
    lastModified: number;
  } | null;
  timestamp: number;
}

const STORAGE_KEY = 'keesha-csv-import-state';
const STATE_EXPIRY_HOURS = 24; // Auto-clear after 24 hours

export const useCSVImportState = () => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState: CSVImportState = JSON.parse(savedState);
        
        // Check if state is not expired
        const hoursElapsed = (Date.now() - parsedState.timestamp) / (1000 * 60 * 60);
        if (hoursElapsed < STATE_EXPIRY_HOURS) {
          setCsvData(parsedState.csvData);
          setLastSaved(new Date(parsedState.timestamp));
          // Note: We can't restore the actual File object, only its metadata
          // The user will need to re-select the file if they want to re-parse it
        } else {
          // Clear expired state
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load CSV import state from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save state to localStorage whenever csvData changes
  useEffect(() => {
    if (csvData.length > 0) {
      setIsSaving(true);
      // Small delay to show saving indicator
      const saveTimeout = setTimeout(() => {
        try {
          const stateToSave: CSVImportState = {
            csvData,
            selectedFile: selectedFile ? {
              name: selectedFile.name,
              size: selectedFile.size,
              lastModified: selectedFile.lastModified
            } : null,
            timestamp: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
          setLastSaved(new Date());
        } catch (error) {
          console.warn('Failed to save CSV import state to localStorage:', error);
        } finally {
          setIsSaving(false);
        }
      }, 300); // 300ms delay for smooth UX

      return () => clearTimeout(saveTimeout);
    } else {
      // Clear state when no data
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
      setIsSaving(false);
    }
  }, [csvData, selectedFile]);

  const clearImportState = useCallback(() => {
    setCsvData([]);
    setSelectedFile(null);
    setLastSaved(null);
    setIsSaving(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateCsvData = useCallback((newData: CSVRow[] | ((prev: CSVRow[]) => CSVRow[])) => {
    setCsvData(newData);
  }, []);

  const hasPersistedData = csvData.length > 0;

  return {
    csvData,
    setCsvData: updateCsvData,
    selectedFile,
    setSelectedFile,
    clearImportState,
    hasPersistedData,
    lastSaved,
    isSaving
  };
};
