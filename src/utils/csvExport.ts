import { Transaction, Account, CSVRow } from '../types';
import { formatDate } from './formatters';

export interface CSVExportRow {
  title: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  date: string;
  description: string;
  isImportant: boolean;
}

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  accounts: Account[],
  filename?: string
): void => {
  // Create a map for quick account lookup
  const accountMap = new Map(accounts.map(account => [account.id, account.name]));

  // Convert transactions to CSV format (matching import format)
  const csvData: CSVExportRow[] = transactions.map(transaction => ({
    title: transaction.title,
    amount: transaction.amount,
    fromAccount: accountMap.get(transaction.fromAccountId) || 'Unknown Account',
    toAccount: accountMap.get(transaction.toAccountId) || 'Unknown Account',
    date: transaction.date,
    description: transaction.description || '',
    isImportant: transaction.isImportant || false
  }));

  // Generate CSV content (matching the exact format used in CSV import)
  const headers = ['title', 'amount', 'fromAccount', 'toAccount', 'date', 'description', 'isImportant'];
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => [
      `"${row.title}"`,
      row.amount.toString(),
      `"${row.fromAccount}"`,
      `"${row.toAccount}"`,
      `"${row.date}"`,
      `"${row.description}"`,
      row.isImportant.toString()
    ].join(','))
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `transactions_${formatDate(new Date().toISOString().split('T')[0])}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateCSVFilename = (transactions: Transaction[]): string => {
  const today = new Date().toISOString().split('T')[0];
  const count = transactions.length;
  return `transactions_${count}_items_${today}.csv`;
};

// Export CSV import data (edited rows) to CSV
export const exportCSVImportDataToCSV = (
  csvRows: CSVRow[],
  accounts: Account[],
  filename?: string
): void => {
  // Create a map for quick account lookup
  const accountMap = new Map(accounts.map(account => [account.id, account.name]));

  // Convert CSV rows to export format
  const csvData = csvRows.map(row => ({
    title: row.title,
    amount: parseFloat(row.amount) || 0,
    fromAccount: accountMap.get(row.fromAccountId) || row.fromAccountId || 'Unknown Account',
    toAccount: accountMap.get(row.toAccountId) || row.toAccountId || 'Unknown Account',
    date: row.date,
    description: row.description || '',
    isImportant: row.isImportant === 'true'
  }));

  // Generate CSV content
  const headers = ['title', 'amount', 'fromAccount', 'toAccount', 'date', 'description', 'isImportant'];
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => [
      `"${row.title.replace(/"/g, '""')}"`,
      row.amount.toString(),
      `"${row.fromAccount.replace(/"/g, '""')}"`,
      `"${row.toAccount.replace(/"/g, '""')}"`,
      row.date,
      `"${row.description.replace(/"/g, '""')}"`,
      row.isImportant.toString()
    ].join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || generateCSVImportFilename(csvRows.length);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Generate filename for CSV import exports
export const generateCSVImportFilename = (count: number): string => {
  const today = new Date().toISOString().split('T')[0];
  return `csv_import_edited_${count}_rows_${today}.csv`;
};
