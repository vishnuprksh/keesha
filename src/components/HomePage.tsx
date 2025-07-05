import React, { useState, useRef, useMemo, useEffect } from 'react';
import * as Papa from 'papaparse';
import { Transaction, Account, CSVRow } from '../types';
import { validateCSVTransaction } from '../utils/validation';
import { useCSVImportState } from '../hooks/useCSVImportState';
import { useCSVImportSessions } from '../hooks/useCSVImportSessions';
import { calculateRunningBalances } from '../utils/balanceCalculator';
import { exportCSVImportDataToCSV } from '../utils/csvExport';
import DraggableCSVRow from './common/DraggableCSVRow';

interface HomePageProps {
  accounts: Account[];
  onImportTransactions: (transactions: Transaction[]) => void;
  userId: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ accounts, onImportTransactions, userId }) => {
  const { csvData, setCsvData, selectedFile, setSelectedFile, clearImportState, hasPersistedData, lastSaved, isSaving } = useCSVImportState();
  const { importSessions, saveImportSession, updateImportSession, deleteImportSession, getImportSession } = useCSVImportSessions(userId);
  const [isImporting, setIsImporting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [currentImportSessionId, setCurrentImportSessionId] = useState<string | null>(null);
  const [showSavedImports, setShowSavedImports] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate running balances for all transactions
  const runningBalancesData = useMemo(() => {
    if (csvData.length === 0) return [];
    return calculateRunningBalances(csvData, accounts, true);
  }, [csvData, accounts]);

  // Helper function to re-validate existing CSV data
  const revalidateCSVData = (data: CSVRow[]): CSVRow[] => {
    return data.map(row => {
      // Create a validation object with both current data and legacy format
      const rowForValidation = {
        ...row,
        fromAccount: row.fromAccountId,
        toAccount: row.toAccountId
      };
      
      const validation = validateCSVTransaction(rowForValidation, accounts);
      
      return {
        ...row,
        fromAccountId: validation.fromAccountId || row.fromAccountId,
        toAccountId: validation.toAccountId || row.toAccountId,
        isValid: validation.isValid,
        errors: validation.errors,
        // Preserve selection only if the row is still valid
        selected: row.selected && validation.isValid
      };
    });
  };

  // Re-validate CSV data when accounts change
  useEffect(() => {
    if (csvData.length > 0 && accounts.length > 0) {
      const revalidated = revalidateCSVData(csvData);
      // Only update if validation results have actually changed
      const hasChanges = revalidated.some((newRow, index) => {
        const oldRow = csvData[index];
        return oldRow && (
          newRow.isValid !== oldRow.isValid ||
          newRow.errors.length !== oldRow.errors.length ||
          newRow.fromAccountId !== oldRow.fromAccountId ||
          newRow.toAccountId !== oldRow.toAccountId
        );
      });
      
      if (hasChanges) {
        setCsvData(revalidated);
      }
    }
  }, [accounts]);

  // Always ensure at least one empty row exists when no data or file is present
  useEffect(() => {
    // Only initialize empty row if we have no CSV data, no selected file, and no persisted data
    if (csvData.length === 0 && !selectedFile && !hasPersistedData && accounts.length > 0) {
      const emptyRow: CSVRow = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: '',
        amount: '',
        fromAccountId: '',
        toAccountId: '',
        date: new Date().toISOString().split('T')[0], // Today's date
        description: '',
        isImportant: 'false',
        isValid: false,
        errors: ['Title is required', 'Amount must be a positive number', 'From account is required', 'To account is required'],
        selected: false
      };
      setCsvData([emptyRow]);
    }
  }, [accounts, selectedFile, hasPersistedData]);

  const validateRow = (row: any): CSVRow => {
    const validation = validateCSVTransaction(row, accounts);
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: row.title || '',
      amount: row.amount || '',
      fromAccountId: validation.fromAccountId || '',
      toAccountId: validation.toAccountId || '',
      date: row.date || '',
      description: row.description || '',
      isImportant: row.isImportant || 'false',
      isValid: validation.isValid,
      errors: validation.errors,
      selected: validation.isValid // Auto-select valid rows by default
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSV(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = (file: File) => {
    setIsImporting(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validatedData = results.data.map((row: any) => validateRow(row));
        // Append to existing data instead of replacing
        setCsvData(prev => [...prev, ...validatedData]);
        setIsImporting(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
        setIsImporting(false);
      }
    });
  };

  const updateRow = (index: number, field: keyof CSVRow, value: string) => {
    setCsvData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Re-validate the row with the updated data structure
      const rowForValidation = {
        ...updated[index],
        fromAccount: updated[index].fromAccountId,
        toAccount: updated[index].toAccountId
      };
      const validatedRow = validateRow(rowForValidation);
      updated[index] = { ...updated[index], isValid: validatedRow.isValid, errors: validatedRow.errors };
      
      return updated;
    });
  };

  const toggleRowSelection = (index: number) => {
    setCsvData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selected: !updated[index].selected };
      return updated;
    });
  };

  const selectAllValid = () => {
    setCsvData(prev => prev.map(row => ({
      ...row,
      selected: row.isValid
    })));
  };

  const deselectAll = () => {
    setCsvData(prev => prev.map(row => ({
      ...row,
      selected: false
    })));
  };

  const removeRow = (index: number) => {
    setCsvData(prev => prev.filter((_, i) => i !== index));
  };

  const reorderRows = (fromIndex: number, toIndex: number) => {
    setCsvData(prev => {
      const newData = [...prev];
      const [movedItem] = newData.splice(fromIndex, 1);
      newData.splice(toIndex, 0, movedItem);
      return newData;
    });
  };

  const insertRow = (index: number, rowToCopy?: CSVRow) => {
    let newRow: CSVRow;
    
    if (rowToCopy) {
      // Copy the provided row
      newRow = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: rowToCopy.title,
        amount: rowToCopy.amount,
        fromAccountId: rowToCopy.fromAccountId,
        toAccountId: rowToCopy.toAccountId,
        date: rowToCopy.date,
        description: rowToCopy.description,
        isImportant: rowToCopy.isImportant,
        isValid: rowToCopy.isValid,
        errors: rowToCopy.errors,
        selected: false // New copied row starts unselected
      };
    } else if (index >= 0 && index < csvData.length) {
      // Copy the row at the specified index
      const sourceRow = csvData[index];
      newRow = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: sourceRow.title,
        amount: sourceRow.amount,
        fromAccountId: sourceRow.fromAccountId,
        toAccountId: sourceRow.toAccountId,
        date: sourceRow.date,
        description: sourceRow.description,
        isImportant: sourceRow.isImportant,
        isValid: sourceRow.isValid,
        errors: sourceRow.errors,
        selected: false // New copied row starts unselected
      };
    } else {
      // Create a blank row (for "Add New Transaction" button when no data exists)
      newRow = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: '',
        amount: '',
        fromAccountId: '',
        toAccountId: '',
        date: new Date().toISOString().split('T')[0], // Today's date
        description: '',
        isImportant: 'false',
        isValid: false,
        errors: ['Title is required', 'Amount must be a positive number', 'From account is required', 'To account is required'],
        selected: false
      };
    }

    setCsvData(prev => {
      const newData = [...prev];
      const insertIndex = rowToCopy ? index + 1 : Math.max(0, index);
      newData.splice(insertIndex, 0, newRow);
      return newData;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (index: number) => {
    // This is called when dragging over a target row
    // We don't need to do anything here as the visual feedback is handled in DraggableCSVRow
  };

  const handleImport = async () => {
    const selectedRows = csvData.filter(row => row.selected && row.isValid);
    
    if (selectedRows.length === 0) {
      alert('No selected valid rows to import. Please select some valid transactions first.');
      return;
    }

    setIsImporting(true);

    try {
      const transactions: Transaction[] = selectedRows.map(row => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: row.title.trim(),
        amount: parseFloat(row.amount),
        fromAccountId: row.fromAccountId,
        toAccountId: row.toAccountId,
        date: row.date,
        description: row.description?.trim() || '',
        isImportant: row.isImportant === 'true'
      }));

      console.log(`HomePage: Starting import of ${transactions.length} selected transactions`);
      await onImportTransactions(transactions);
      console.log(`HomePage: Import completed successfully`);
      
      // Save or update the import session to database
      if (userId) {
        try {
          const validRows = csvData.filter(row => row.isValid).length;
          const totalRows = csvData.length;
          
          if (currentImportSessionId) {
            // Update existing session
            const remainingRows = csvData.filter(row => !selectedRows.map(r => r.id).includes(row.id));
            const status = remainingRows.filter(row => row.isValid && row.selected).length > 0 ? 'partial' : 'completed';
            
            await updateImportSession(currentImportSessionId, {
              csvData: remainingRows,
              importedRows: (await getImportSession(currentImportSessionId))?.importedRows || 0 + transactions.length,
              status,
              updatedAt: new Date()
            });
          } else {
            // Create new session
            const sessionName = selectedFile?.name || `Import ${new Date().toLocaleDateString()}`;
            const sessionId = await saveImportSession({
              name: sessionName,
              fileName: selectedFile?.name || 'unknown.csv',
              importDate: new Date().toISOString(),
              totalRows,
              validRows,
              importedRows: transactions.length,
              csvData: csvData.filter(row => !selectedRows.map(r => r.id).includes(row.id)), // Save remaining rows
              status: csvData.filter(row => !selectedRows.map(r => r.id).includes(row.id) && row.isValid && row.selected).length > 0 ? 'partial' : 'completed'
            });
            setCurrentImportSessionId(sessionId);
          }
        } catch (sessionError) {
          console.warn('Failed to save import session:', sessionError);
          // Don't fail the import if session saving fails
        }
      }
      
      // Remove only the imported transactions from the displayed table
      const importedRowIds = new Set(selectedRows.map(row => row.id));
      setCsvData(prev => prev.filter(row => !importedRowIds.has(row.id)));
      
      alert(`Successfully imported ${transactions.length} selected transactions! The data should appear on other pages within a few seconds due to real-time sync.`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import transactions. Please try again or check the console for details.');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const bankAccount = accounts.find(acc => acc.type === 'bank')?.name || 'Main Bank Account';
    const incomeAccount = accounts.find(acc => acc.type === 'income')?.name || 'Income';
    const expenseAccount = accounts.find(acc => acc.type === 'expense')?.name || 'Food & Dining';
    
    const template = [
      ['title', 'amount', 'fromAccount', 'toAccount', 'date', 'description', 'isImportant'],
      ['Salary Payment', '3500.00', incomeAccount, bankAccount, '2025-06-01', 'Monthly salary', 'true'],
      ['Grocery Shopping', '45.67', bankAccount, expenseAccount, '2025-06-01', 'Weekly groceries', 'false'],
      ['Transfer to Savings', '500.00', bankAccount, 'Savings Account', '2025-06-02', 'Monthly savings transfer', 'false']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const saveCurrentSession = async () => {
    if (!userId || csvData.length === 0) return;

    try {
      const validRows = csvData.filter(row => row.isValid).length;
      const totalRows = csvData.length;
      const sessionName = selectedFile?.name || `Import ${new Date().toLocaleDateString()}`;
      
      if (currentImportSessionId) {
        // Update existing session
        await updateImportSession(currentImportSessionId, {
          csvData,
          updatedAt: new Date()
        });
        alert('Import session updated successfully!');
      } else {
        // Create new session
        const sessionId = await saveImportSession({
          name: sessionName,
          fileName: selectedFile?.name || 'unknown.csv',
          importDate: new Date().toISOString(),
          totalRows,
          validRows,
          importedRows: 0,
          csvData,
          status: 'pending'
        });
        setCurrentImportSessionId(sessionId);
        alert('Import session saved successfully!');
      }
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save import session. Please try again.');
    }
  };

  const downloadEditedCSV = () => {
    if (csvData.length === 0) {
      alert('No data to download. Please upload and edit a CSV file first.');
      return;
    }

    const filename = selectedFile?.name 
      ? `edited_${selectedFile.name}` 
      : `edited_import_${new Date().toISOString().split('T')[0]}.csv`;
    
    exportCSVImportDataToCSV(csvData, accounts, filename);
  };

  const loadImportSession = async (sessionId: string) => {
    try {
      const session = await getImportSession(sessionId);
      if (session) {
        // Re-validate all CSV rows against current accounts to ensure they're up-to-date
        const revalidatedData = revalidateCSVData(session.csvData);
        
        setCsvData(revalidatedData);
        setCurrentImportSessionId(sessionId);
        setSelectedFile(new File([], session.fileName, { type: 'text/csv' }));
        
        const validCount = revalidatedData.filter(row => row.isValid).length;
        const totalCount = revalidatedData.length;
        alert(`Loaded import session: ${session.name}\n${validCount}/${totalCount} rows are valid after re-validation.`);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert('Failed to load import session. Please try again.');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this import session?')) {
      try {
        await deleteImportSession(sessionId);
        if (currentImportSessionId === sessionId) {
          setCurrentImportSessionId(null);
        }
        alert('Import session deleted successfully!');
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete import session. Please try again.');
      }
    }
  };

  return (
    <div className="csv-import">
      <div className="csv-import-header">
        <h2>🏠 Welcome to Keesha</h2>
        <p>Your personal expense tracker - Add transactions manually below or import from a CSV file. CSV imports will be added to your existing transactions.</p>
        {hasPersistedData && (
          <div className="auto-save-notice">
            <span className="auto-save-icon">💾</span>
            <span>
              Auto-saved data restored - your previous CSV import is still here!
              {lastSaved && (
                <small style={{ display: 'block', opacity: 0.9, fontSize: '0.9em' }}>
                  Last saved: {lastSaved.toLocaleString()}
                </small>
              )}
            </span>
            <button onClick={clearImportState} className="clear-data-btn" title="Clear saved data">
              Clear Data
            </button>
          </div>
        )}
      </div>

      <div className="csv-upload-section">
        <h3>📄 Import Transactions from CSV</h3>
        <div className="upload-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input"
            id="csv-file"
          />
          <label htmlFor="csv-file" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose CSV File'}
          </label>
          <button onClick={downloadTemplate} className="template-btn">
            Download Template
          </button>
          {userId && (
            <button 
              onClick={() => setShowSavedImports(!showSavedImports)} 
              className="template-btn"
              title="View saved import sessions"
            >
              📂 Saved Imports ({importSessions.length})
            </button>
          )}
        </div>

        {/* Saved Imports Section */}
        {showSavedImports && userId && (
          <div className="saved-imports-section">
            <h4>📂 Saved Import Sessions</h4>
            {importSessions.length === 0 ? (
              <p className="no-imports">No saved import sessions found.</p>
            ) : (
              <div className="import-sessions-list">
                {importSessions.map((session) => (
                  <div key={session.id} className="import-session-item">
                    <div className="session-info">
                      <strong>{session.name}</strong>
                      <span className="session-details">
                        {session.totalRows} rows, {session.importedRows} imported
                        <span className={`status-badge ${session.status}`}>
                          {session.status}
                        </span>
                      </span>
                      <small>{new Date(session.importDate).toLocaleString()}</small>
                    </div>
                    <div className="session-actions">
                      <button 
                        onClick={() => loadImportSession(session.id)}
                        className="load-btn"
                        title="Load this import session"
                      >
                        📂 Load
                      </button>
                      <button 
                        onClick={() => deleteSession(session.id)}
                        className="delete-btn"
                        title="Delete this import session"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isImporting && <p className="loading">Parsing CSV file...</p>}
      </div>

      {/* Always show the transaction table */}
      <div className="csv-data-section">
        <div className="data-header">
          <h3>Transaction Data ({csvData.length} rows)</h3>
          <div className="data-header-right">
            {isSaving && (
              <span className="auto-save-indicator">
                <span className="saving-dot"></span>
                Auto-saving...
              </span>
            )}
            <div className="import-actions">
              <div className="selection-controls">
                <button 
                  onClick={selectAllValid}
                  className="selection-btn"
                  type="button"
                  disabled={csvData.filter(row => row.isValid).length === 0}
                >
                  Select All Valid
                </button>
                <button 
                  onClick={deselectAll}
                  className="selection-btn"
                  type="button"
                  disabled={csvData.filter(row => row.selected).length === 0}
                >
                  Deselect All
                </button>
              </div>
              <div className="action-buttons">
                {userId && csvData.length > 0 && csvData.some(row => row.title || row.amount) && (
                  <button 
                    onClick={saveCurrentSession}
                    className="save-btn"
                    title="Save current import session to database"
                  >
                    💾 Save Session
                  </button>
                )}
                {csvData.length > 0 && csvData.some(row => row.title || row.amount) && (
                  <button 
                    onClick={downloadEditedCSV}
                    className="download-btn"
                    title="Download edited CSV with your changes"
                  >
                    📥 Download Edited CSV
                  </button>
                )}
                <button 
                  onClick={handleImport}
                  className="import-btn"
                  disabled={csvData.filter(row => row.selected && row.isValid).length === 0 || isImporting}
                >
                  {isImporting 
                    ? `Importing ${csvData.filter(row => row.selected && row.isValid).length} transactions...`
                    : `Import ${csvData.filter(row => row.selected && row.isValid).length} Selected Transactions`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

          <div className="csv-table-container">
            <table className="csv-table">
              <thead>
                <tr>
                  <th className="drag-header">⋮⋮</th>
                  <th className="select-header">
                    <input
                      type="checkbox"
                      checked={csvData.length > 0 && csvData.filter(row => row.isValid).every(row => row.selected)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllValid();
                        } else {
                          deselectAll();
                        }
                      }}
                      disabled={csvData.filter(row => row.isValid).length === 0}
                      title="Select/Deselect all valid transactions"
                    />
                  </th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>From Account</th>
                  <th>To Account</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Balance After</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => {
                  const balanceData = runningBalancesData.find(
                    (item, idx) => idx === index
                  );
                  const runningBalances = balanceData?.runningBalances || {};

                  return (
                    <DraggableCSVRow
                      key={row.id}
                      row={row}
                      index={index}
                      accounts={accounts}
                      runningBalances={runningBalances}
                      onUpdateRow={updateRow}
                      onRemoveRow={removeRow}
                      onReorderRows={reorderRows}
                      onInsertRow={insertRow}
                      onToggleSelection={toggleRowSelection}
                      draggedIndex={draggedIndex}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                    />
                  );
                })}
                <tr className="add-transaction-row">
                  <td colSpan={10}>
                    <button
                      onClick={() => insertRow(csvData.length)}
                      className="add-transaction-btn"
                      type="button"
                    >
                      ➕ Add New Transaction
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="import-summary">
            <p>
              <strong>Summary:</strong> {csvData.filter(row => row.isValid).length} valid rows, {' '}
              {csvData.filter(row => !row.isValid).length} invalid rows, {' '}
              {csvData.filter(row => row.selected && row.isValid).length} selected for import
            </p>
          </div>
        </div>

      <div className="csv-format-info">
        <h4>CSV Format Requirements:</h4>
        <ul>
          <li><strong>title:</strong> Name/description of the transaction (required)</li>
          <li><strong>amount:</strong> Positive number (required)</li>
          <li><strong>fromAccount:</strong> Source account name or ID (required)</li>
          <li><strong>toAccount:</strong> Destination account name or ID (required)</li>
          <li><strong>date:</strong> Date in YYYY-MM-DD format (required)</li>
          <li><strong>description:</strong> Additional details (optional)</li>
        </ul>
        <p><strong>Available accounts:</strong> {accounts.map(acc => `${acc.name} (${acc.type})`).join(', ')}</p>
      </div>
    </div>
  );
};

export default HomePage;
