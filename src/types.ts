export type AccountType = 'bank' | 'income' | 'expense' | 'asset' | 'liability';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  description?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  description?: string;
  isImportant?: boolean;
}

// Keep Expense interface for backward compatibility during migration
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type?: 'expense';
}

// Expense categories for backward compatibility
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Other Expenses'
] as const;

// Default accounts that should be created
export const DEFAULT_ACCOUNTS: Omit<Account, 'id'>[] = [
  { name: 'Main Bank Account', type: 'bank', balance: 0, description: 'Primary checking account' },
  { name: 'Savings Account', type: 'bank', balance: 0, description: 'Savings account' },
  { name: 'Income', type: 'income', balance: 0, description: 'All income sources' },
  { name: 'Food & Dining', type: 'expense', balance: 0, description: 'Restaurant and grocery expenses' },
  { name: 'Transportation', type: 'expense', balance: 0, description: 'Gas, public transport, etc.' },
  { name: 'Shopping', type: 'expense', balance: 0, description: 'Retail purchases' },
  { name: 'Entertainment', type: 'expense', balance: 0, description: 'Movies, games, recreation' },
  { name: 'Bills & Utilities', type: 'expense', balance: 0, description: 'Utilities, subscriptions' },
  { name: 'Healthcare', type: 'expense', balance: 0, description: 'Medical expenses' },
  { name: 'Other Expenses', type: 'expense', balance: 0, description: 'Miscellaneous expenses' }
];

// Helper functions
export const getAccountsByType = (accounts: Account[], type: AccountType): Account[] => {
  return accounts.filter(account => account.type === type);
};

export const getTransactionType = (transaction: Transaction, accounts: Account[]): 'income' | 'expense' | 'transfer' => {
  const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
  const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
  
  if (!fromAccount || !toAccount) return 'transfer';
  
  if (fromAccount.type === 'income' && toAccount.type === 'bank') {
    return 'income';
  } else if (fromAccount.type === 'bank' && toAccount.type === 'expense') {
    return 'expense';
  } else {
    return 'transfer';
  }
};

export const getAccountTypeColor = (type: AccountType): string => {
  switch (type) {
    case 'bank':
      return '#007bff';
    case 'income':
      return '#28a745';
    case 'expense':
      return '#dc3545';
    case 'asset':
      return '#17a2b8';
    case 'liability':
      return '#ffc107';
    default:
      return '#6c757d';
  }
};
