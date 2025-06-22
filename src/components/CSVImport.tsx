import React, { useState, useRef, useMemo } from 'react';
import * as Papa from 'papaparse';
import { Transaction, Account, CSVRow } from '../types';
import { validateCSVTransaction } from '../utils/validation';
import { useCSVImportState } from '../hooks/useCSVImportState';
import { calculateRunningBalances } from '../utils/balanceCalculator';
import DraggableCSVRow from './common/DraggableCSVRow';

interface CSVImportProps {
  accounts: Account[];
  onImportTransactions: (transactions: Transaction[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ accounts, onImportTransactions }) => {
  const { csvData, setCsvData, selectedFile, setSelectedFile, clearImportState, hasPersistedData, lastSaved, isSaving } = useCSVImportState();
  const [isImporting, setIsImporting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate running balances for all transactions
  const runningBalancesData = useMemo(() => {
    if (csvData.length === 0) return [];
    return calculateRunningBalances(csvData, accounts, true);
  }, [csvData, accounts]);

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
        setCsvData(validatedData);
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

  const insertRow = (index: number) => {
    const newRow: CSVRow = {
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

    setCsvData(prev => {
      const newData = [...prev];
      newData.splice(index, 0, newRow);
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

      console.log(`CSV Import: Starting import of ${transactions.length} selected transactions`);
      await onImportTransactions(transactions);
      console.log(`CSV Import: Import completed successfully`);
      
      // Reset the component
      clearImportState();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
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

  return (
    <div className="csv-import">
      <div className="csv-import-header">
        <h2>📄 Import Transactions from CSV</h2>
        <p>Upload a CSV file to import multiple transactions at once</p>
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
        </div>

        {isImporting && <p className="loading">Parsing CSV file...</p>}
      </div>

      {csvData.length > 0 && (
        <div className="csv-data-section">
          <div className="data-header">
            <h3>Preview & Edit Data ({csvData.length} rows)</h3>
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
                {csvData.length > 0 && (
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
                )}
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
      )}

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

export default CSVImport;
