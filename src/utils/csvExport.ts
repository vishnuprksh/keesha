import { Transaction, Account } from '../types';
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
