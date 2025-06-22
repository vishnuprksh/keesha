import { Transaction, Account } from '../types';
import { isDateInRange } from '../utils/dateUtils';

// Filtering and searching utilities

export interface TransactionFilters {
  search: string;
  accountId: string;
  transactionType: '' | 'income' | 'expense' | 'transfer';
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  showImportantOnly: boolean;
}

export const filterTransactions = (
  transactions: Transaction[],
  accounts: Account[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions.filter(transaction => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = transaction.title.toLowerCase().includes(searchLower);
      const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
      const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
      const matchesAccount = 
        fromAccount?.name.toLowerCase().includes(searchLower) ||
        toAccount?.name.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesAccount) {
        return false;
      }
    }

    // Account filter
    if (filters.accountId) {
      if (transaction.fromAccountId !== filters.accountId && 
          transaction.toAccountId !== filters.accountId) {
        return false;
      }
    }

    // Transaction type filter
    if (filters.transactionType) {
      const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
      
      if (!fromAccount || !toAccount) return false;
      
      let actualType: 'income' | 'expense' | 'transfer' = 'transfer';
      
      if (fromAccount.type === 'income' && toAccount.type === 'bank') {
        actualType = 'income';
      } else if (fromAccount.type === 'bank' && toAccount.type === 'expense') {
        actualType = 'expense';
      }
      
      if (actualType !== filters.transactionType) {
        return false;
      }
    }

    // Date range filter
    if (!isDateInRange(transaction.date, filters.dateFrom, filters.dateTo)) {
      return false;
    }

    // Amount range filter
    if (filters.amountMin && transaction.amount < parseFloat(filters.amountMin)) {
      return false;
    }
    
    if (filters.amountMax && transaction.amount > parseFloat(filters.amountMax)) {
      return false;
    }

    // Important transactions filter
    if (filters.showImportantOnly && !transaction.isImportant) {
      return false;
    }

    return true;
  });
};

export const sortTransactions = (
  transactions: Transaction[],
  sortBy: 'date' | 'amount' | 'title' | 'important',
  sortOrder: 'asc' | 'desc'
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'important':
        // Sort important first (true comes before false)
        const aImportant = a.isImportant ? 1 : 0;
        const bImportant = b.isImportant ? 1 : 0;
        comparison = bImportant - aImportant;
        // If both have same importance, sort by date as secondary
        if (comparison === 0) {
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

export const searchAccounts = (accounts: Account[], searchTerm: string): Account[] => {
  if (!searchTerm) return accounts;
  
  const searchLower = searchTerm.toLowerCase();
  return accounts.filter(account =>
    account.name.toLowerCase().includes(searchLower) ||
    account.type.toLowerCase().includes(searchLower) ||
    account.description?.toLowerCase().includes(searchLower)
  );
};
