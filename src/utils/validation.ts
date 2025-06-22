import { Transaction, Account } from '../types';

// Validation utilities for forms and data

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTransactionForm = (data: {
  title: string;
  amount: string;
  fromAccountId: string;
  toAccountId: string;
  date: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  }

  if (!data.fromAccountId) {
    errors.push({ field: 'fromAccountId', message: 'Source account is required' });
  }

  if (!data.toAccountId) {
    errors.push({ field: 'toAccountId', message: 'Destination account is required' });
  }

  if (data.fromAccountId === data.toAccountId) {
    errors.push({ field: 'accounts', message: 'Source and destination accounts cannot be the same' });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  }

  return errors;
};

export const validateAccountForm = (data: {
  name: string;
  type: string;
  balance: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Account name is required' });
  }

  if (!data.type) {
    errors.push({ field: 'type', message: 'Account type is required' });
  }

  const balance = parseFloat(data.balance);
  if (isNaN(balance)) {
    errors.push({ field: 'balance', message: 'Balance must be a valid number' });
  }

  return errors;
};

export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const isAccountUsedInTransactions = (accountId: string, transactions: Transaction[]): boolean => {
  return transactions.some(t => t.fromAccountId === accountId || t.toAccountId === accountId);
};

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  fromAccountId?: string;
  toAccountId?: string;
}

export const validateCSVTransaction = (row: any, accounts: Account[]): CSVValidationResult => {
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

  // Validate fromAccount - check both original CSV field and updated field
  const fromAccountIdentifier = row.fromAccountId || row.fromAccount;
  const fromAccount = accounts.find(acc => acc.name === fromAccountIdentifier || acc.id === fromAccountIdentifier);
  if (!fromAccountIdentifier || !fromAccount) {
    errors.push(`From account "${fromAccountIdentifier || 'undefined'}" not found`);
    isValid = false;
  }

  // Validate toAccount - check both original CSV field and updated field
  const toAccountIdentifier = row.toAccountId || row.toAccount;
  const toAccount = accounts.find(acc => acc.name === toAccountIdentifier || acc.id === toAccountIdentifier);
  if (!toAccountIdentifier || !toAccount) {
    errors.push(`To account "${toAccountIdentifier || 'undefined'}" not found`);
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
    isValid,
    errors,
    fromAccountId: fromAccount?.id,
    toAccountId: toAccount?.id
  };
};
