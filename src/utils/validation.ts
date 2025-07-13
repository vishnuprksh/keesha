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

  // Helper function to find account with intelligent semantic matching
  const findAccountWithIntelligentMatch = (identifier: string, isFromAccount: boolean = true): Account | undefined => {
    if (!identifier) return undefined;
    
    // Exact match first
    let account = accounts.find(acc => acc.name === identifier || acc.id === identifier);
    if (account) return account;
    
    // Try partial match (case insensitive)
    const lowerIdentifier = identifier.toLowerCase();
    account = accounts.find(acc => 
      acc.name.toLowerCase() === lowerIdentifier ||
      acc.name.toLowerCase().includes(lowerIdentifier) ||
      lowerIdentifier.includes(acc.name.toLowerCase())
    );
    if (account) return account;
    
    // Try matching without parentheses and type info
    const cleanIdentifier = identifier.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    if (cleanIdentifier !== identifier) {
      account = accounts.find(acc => 
        acc.name === cleanIdentifier ||
        acc.name.toLowerCase() === cleanIdentifier.toLowerCase()
      );
      if (account) return account;
    }
    
    // Intelligent semantic matching based on keywords
    const getSemanticMatches = (query: string): Account[] => {
      const queryLower = query.toLowerCase();
      const matches: Account[] = [];
      
      // Food/Grocery matching
      if (queryLower.includes('food') || queryLower.includes('grocery') || queryLower.includes('dining') || 
          queryLower.includes('restaurant') || queryLower.includes('meal')) {
        matches.push(...accounts.filter(acc => 
          acc.type === 'expense' && 
          (acc.name.toLowerCase().includes('food') || acc.name.toLowerCase().includes('grocery') ||
           acc.name.toLowerCase().includes('dining') || acc.name.toLowerCase().includes('restaurant'))
        ));
      }
      
      // Entertainment matching
      if (queryLower.includes('entertainment') || queryLower.includes('movie') || queryLower.includes('game')) {
        matches.push(...accounts.filter(acc => 
          acc.type === 'expense' && 
          (acc.name.toLowerCase().includes('entertainment') || acc.name.toLowerCase().includes('fun') ||
           acc.name.toLowerCase().includes('leisure'))
        ));
      }
      
      // Travel matching
      if (queryLower.includes('travel') || queryLower.includes('transport') || queryLower.includes('fuel') || 
          queryLower.includes('taxi') || queryLower.includes('uber')) {
        matches.push(...accounts.filter(acc => 
          acc.type === 'expense' && 
          (acc.name.toLowerCase().includes('travel') || acc.name.toLowerCase().includes('transport') ||
           acc.name.toLowerCase().includes('fuel') || acc.name.toLowerCase().includes('gas'))
        ));
      }
      
      // Utilities matching
      if (queryLower.includes('utility') || queryLower.includes('electric') || queryLower.includes('water') || 
          queryLower.includes('internet') || queryLower.includes('wifi') || queryLower.includes('phone')) {
        matches.push(...accounts.filter(acc => 
          acc.type === 'expense' && 
          (acc.name.toLowerCase().includes('utility') || acc.name.toLowerCase().includes('electric') ||
           acc.name.toLowerCase().includes('water') || acc.name.toLowerCase().includes('internet') ||
           acc.name.toLowerCase().includes('wifi') || acc.name.toLowerCase().includes('phone'))
        ));
      }
      
      // Bank matching
      if (queryLower.includes('bank') || queryLower.includes('sib') || queryLower.includes('sbi') || 
          queryLower.includes('savings') || queryLower.includes('current')) {
        matches.push(...accounts.filter(acc => 
          (acc.type === 'bank' || acc.type === 'asset') && 
          (acc.name.toLowerCase().includes('bank') || acc.name.toLowerCase().includes('sib') ||
           acc.name.toLowerCase().includes('sbi') || acc.name.toLowerCase().includes('savings') ||
           acc.name.toLowerCase().includes('current'))
        ));
      }
      
      // Income matching
      if (queryLower.includes('salary') || queryLower.includes('income') || queryLower.includes('wage')) {
        matches.push(...accounts.filter(acc => 
          acc.type === 'income' && 
          (acc.name.toLowerCase().includes('salary') || acc.name.toLowerCase().includes('income') ||
           acc.name.toLowerCase().includes('wage') || acc.name.toLowerCase().includes('pay'))
        ));
      }
      
      return matches;
    };
    
    const semanticMatches = getSemanticMatches(identifier);
    if (semanticMatches.length > 0) {
      return semanticMatches[0]; // Return first match
    }
    
    // Fallback to account type matching
    if (isFromAccount) {
      // For fromAccount, prefer bank/asset accounts
      account = accounts.find(acc => acc.type === 'bank' || acc.type === 'asset');
      if (account) return account;
    } else {
      // For toAccount, prefer expense accounts
      account = accounts.find(acc => acc.type === 'expense');
      if (account) return account;
    }
    
    return undefined;
  };

  // Validate fromAccount - check both original CSV field and updated field
  const fromAccountIdentifier = row.fromAccountId || row.fromAccount;
  const fromAccount = findAccountWithIntelligentMatch(fromAccountIdentifier, true);
  let fromAccountId = fromAccount?.id;
  
  if (!fromAccountIdentifier) {
    errors.push('From account is required');
    isValid = false;
  } else if (!fromAccount) {
    errors.push(`From account "${fromAccountIdentifier}" not found`);
    // Only use fallback for truly missing accounts
    const unknownAccount = accounts.find(acc => acc.name === 'Unknown' && acc.type === 'transaction') ||
                          accounts.find(acc => acc.type === 'transaction') ||
                          accounts.find(acc => acc.type === 'bank') ||
                          accounts.find(acc => acc.type === 'asset') ||
                          accounts[0];
    fromAccountId = unknownAccount?.id;
    if (!fromAccountId) {
      isValid = false;
    }
  }

  // Validate toAccount - check both original CSV field and updated field
  const toAccountIdentifier = row.toAccountId || row.toAccount;
  const toAccount = findAccountWithIntelligentMatch(toAccountIdentifier, false);
  let toAccountId = toAccount?.id;
  
  if (!toAccountIdentifier) {
    errors.push('To account is required');
    isValid = false;
  } else if (!toAccount) {
    errors.push(`To account "${toAccountIdentifier}" not found`);
    // Only use fallback for truly missing accounts
    const unknownAccount = accounts.find(acc => acc.name === 'Unknown' && acc.type === 'transaction') ||
                          accounts.find(acc => acc.type === 'transaction') ||
                          accounts.find(acc => acc.type === 'expense') ||
                          accounts[0];
    toAccountId = unknownAccount?.id;
    if (!toAccountId) {
      isValid = false;
    }
  }

  // Validate that from and to accounts are different
  if (fromAccountId && toAccountId && fromAccountId === toAccountId) {
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
    fromAccountId: fromAccountId,
    toAccountId: toAccountId
  };
};
