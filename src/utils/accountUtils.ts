import { AccountType } from '../types';

/**
 * Get the emoji icon for an account type
 */
export const getAccountTypeIcon = (type: AccountType): string => {
  switch (type) {
    case 'bank': return '🏦';
    case 'income': return '📈';
    case 'expense': return '📉';
    case 'asset': return '💎';
    case 'liability': return '💳';
    case 'transaction': return '🔄';
    default: return '💰';
  }
};

/**
 * Get the display name for an account type
 */
export const getAccountTypeName = (type: AccountType): string => {
  switch (type) {
    case 'bank': return 'Bank Account';
    case 'income': return 'Income Account';
    case 'expense': return 'Expense Account';
    case 'asset': return 'Asset Account';
    case 'liability': return 'Liability Account';
    case 'transaction': return 'Transaction Account';
    default: return 'Account';
  }
};

/**
 * Get the full display string with icon and name
 */
export const getAccountTypeDisplay = (type: AccountType): string => {
  return `${getAccountTypeIcon(type)} ${getAccountTypeName(type)}`;
};
