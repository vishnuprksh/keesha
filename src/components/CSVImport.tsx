import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Transaction, Account } from '../types';

interface CSVRow {
  id: string;
  title: string;
  amount: string;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  description: string;
  isValid: boolean;
  errors: string[];
}

interface CSVImportProps {
  accounts: Account[];
  onImportTransactions: (transactions: Transaction[]) => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ accounts, onImportTransactions }) => {
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateRow = (row: any): CSVRow => {
    const errors: string[] = [];
    let isValid = true;

    // Validate title
    if (!row.title || row.title.trim() === '') {
      errors.push('Title is required');
      isValid = false;
    }

    // Validate amount
    const amount = parseFloat(row.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
      isValid = false;
    }

    // Validate fromAccount
    const fromAccount = accounts.find(acc => acc.name === row.fromAccount || acc.id === row.fromAccount);
    if (!fromAccount) {
      errors.push(`From account "${row.fromAccount}" not found`);
      isValid = false;
    }

    // Validate toAccount
    const toAccount = accounts.find(acc => acc.name === row.toAccount || acc.id === row.toAccount);
    if (!toAccount) {
      errors.push(`To account "${row.toAccount}" not found`);
      isValid = false;
    }

    // Validate that from and to accounts are different
    if (fromAccount && toAccount && fromAccount.id === toAccount.id) {
      errors.push('From and To accounts must be different');
      isValid = false;
    }

    // Validate date
    const date = new Date(row.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be in a valid format (YYYY-MM-DD)');
      isValid = false;
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: row.title || '',
      amount: row.amount || '',
      fromAccountId: fromAccount?.id || '',
      toAccountId: toAccount?.id || '',
      date: row.date || '',
      description: row.description || '',
      isValid,
      errors
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
      
      // Re-validate the row
      const validatedRow = validateRow(updated[index]);
      updated[index] = { ...updated[index], isValid: validatedRow.isValid, errors: validatedRow.errors };
      
      return updated;
    });
  };

  const removeRow = (index: number) => {
    setCsvData(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    const validRows = csvData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      alert('No valid rows to import. Please fix the errors first.');
      return;
    }

    const transactions: Transaction[] = validRows.map(row => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: row.title.trim(),
      amount: parseFloat(row.amount),
      fromAccountId: row.fromAccountId,
      toAccountId: row.toAccountId,
      date: row.date,
      description: row.description?.trim() || ''
    }));

    onImportTransactions(transactions);
    
    // Reset the component
    setCsvData([]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    alert(`Successfully imported ${transactions.length} transactions!`);
  };

  const downloadTemplate = () => {
    const bankAccount = accounts.find(acc => acc.type === 'bank')?.name || 'Main Bank Account';
    const incomeAccount = accounts.find(acc => acc.type === 'income')?.name || 'Income';
    const expenseAccount = accounts.find(acc => acc.type === 'expense')?.name || 'Food & Dining';
    
    const template = [
      ['title', 'amount', 'fromAccount', 'toAccount', 'date', 'description'],
      ['Salary Payment', '3500.00', incomeAccount, bankAccount, '2025-06-01', 'Monthly salary'],
      ['Grocery Shopping', '45.67', bankAccount, expenseAccount, '2025-06-01', 'Weekly groceries'],
      ['Transfer to Savings', '500.00', bankAccount, 'Savings Account', '2025-06-02', 'Monthly savings transfer']
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
            <div className="import-actions">
              <button 
                onClick={handleImport}
                className="import-btn"
                disabled={csvData.filter(row => row.isValid).length === 0}
              >
                Import {csvData.filter(row => row.isValid).length} Valid Transactions
              </button>
            </div>
          </div>

          <div className="csv-table-container">
            <table className="csv-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>From Account</th>
                  <th>To Account</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, index) => (
                  <tr key={row.id} className={row.isValid ? 'valid-row' : 'invalid-row'}>
                    <td>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateRow(index, 'title', e.target.value)}
                        className={row.errors.some(e => e.includes('Title')) ? 'error' : ''}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => updateRow(index, 'amount', e.target.value)}
                        className={row.errors.some(e => e.includes('Amount')) ? 'error' : ''}
                      />
                    </td>
                    <td>
                      <select
                        value={row.fromAccountId}
                        onChange={(e) => updateRow(index, 'fromAccountId', e.target.value)}
                        className={row.errors.some(e => e.includes('From account')) ? 'error' : ''}
                      >
                        <option value="">Select From Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={row.toAccountId}
                        onChange={(e) => updateRow(index, 'toAccountId', e.target.value)}
                        className={row.errors.some(e => e.includes('To account')) ? 'error' : ''}
                      >
                        <option value="">Select To Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(index, 'date', e.target.value)}
                        className={row.errors.some(e => e.includes('Date')) ? 'error' : ''}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(index, 'description', e.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                    <td className={`status ${row.isValid ? 'valid' : 'invalid'}`}>
                      {row.isValid ? (
                        <span className="status-valid">✓ Valid</span>
                      ) : (
                        <div className="status-invalid">
                          <span>✗ Invalid</span>
                          <div className="error-list">
                            {row.errors.map((error, i) => (
                              <div key={i} className="error-item">{error}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => removeRow(index)}
                        className="remove-btn"
                        title="Remove this row"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="import-summary">
            <p>
              <strong>Summary:</strong> {csvData.filter(row => row.isValid).length} valid rows, {' '}
              {csvData.filter(row => !row.isValid).length} invalid rows
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
