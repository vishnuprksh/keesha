import { Transaction, Account, CSVRow } from '../types';

export interface TransactionWithBalance {
  transaction: Transaction | CSVRow;
  accountBalances: { [accountId: string]: number };
  runningBalances: { [accountId: string]: number };
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
}

/**
 * Calculate running balances for a list of transactions
 * @param transactions List of transactions (can be Transaction or CSVRow)
 * @param accounts List of all accounts with their initial balances
 * @param isCSVRows Whether the transactions are CSVRow objects (true) or Transaction objects (false)
 * @returns Array of transactions with their respective account balances after each transaction
 */
export const calculateRunningBalances = (
  transactions: (Transaction | CSVRow)[],
  accounts: Account[],
  isCSVRows: boolean = false
): TransactionWithBalance[] => {
  // Create a copy of account balances to track running totals
  const runningBalances: { [accountId: string]: number } = {};
  accounts.forEach(account => {
    runningBalances[account.id] = account.balance;
  });

  const result: TransactionWithBalance[] = [];

  // Sort transactions by date to ensure proper chronological order
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  sortedTransactions.forEach(transaction => {
    // Extract transaction details based on type
    const fromAccountId = isCSVRows ? (transaction as CSVRow).fromAccountId : (transaction as Transaction).fromAccountId;
    const toAccountId = isCSVRows ? (transaction as CSVRow).toAccountId : (transaction as Transaction).toAccountId;
    const amount = isCSVRows ? parseFloat((transaction as CSVRow).amount) : (transaction as Transaction).amount;

    // Create a snapshot of current balances before applying this transaction
    const accountBalances = { ...runningBalances };

    // Apply transaction to running balances
    if (fromAccountId && runningBalances[fromAccountId] !== undefined) {
      runningBalances[fromAccountId] -= amount;
    }
    if (toAccountId && runningBalances[toAccountId] !== undefined) {
      runningBalances[toAccountId] += amount;
    }

    // Store the result with both pre and post transaction balances
    result.push({
      transaction,
      accountBalances, // Balances before this transaction
      runningBalances: { ...runningBalances } // Balances after this transaction
    });
  });

  return result;
};

/**
 * Get account balances that are affected by a specific transaction
 * @param transaction The transaction to analyze
 * @param accounts List of all accounts
 * @param runningBalances Current running balances
 * @param isCSVRow Whether the transaction is a CSVRow object
 * @returns Array of affected account balances
 */
export const getAffectedAccountBalances = (
  transaction: Transaction | CSVRow,
  accounts: Account[],
  runningBalances: { [accountId: string]: number },
  isCSVRow: boolean = false
): AccountBalance[] => {
  const fromAccountId = isCSVRow ? (transaction as CSVRow).fromAccountId : (transaction as Transaction).fromAccountId;
  const toAccountId = isCSVRow ? (transaction as CSVRow).toAccountId : (transaction as Transaction).toAccountId;

  const affectedBalances: AccountBalance[] = [];

  if (fromAccountId) {
    const account = accounts.find(acc => acc.id === fromAccountId);
    if (account && runningBalances[fromAccountId] !== undefined) {
      affectedBalances.push({
        accountId: fromAccountId,
        accountName: account.name,
        balance: runningBalances[fromAccountId]
      });
    }
  }

  if (toAccountId && toAccountId !== fromAccountId) {
    const account = accounts.find(acc => acc.id === toAccountId);
    if (account && runningBalances[toAccountId] !== undefined) {
      affectedBalances.push({
        accountId: toAccountId,
        accountName: account.name,
        balance: runningBalances[toAccountId]
      });
    }
  }

  return affectedBalances;
};

/**
 * Recalculate running balances after reordering transactions
 * @param reorderedTransactions New order of transactions
 * @param accounts List of all accounts
 * @param isCSVRows Whether dealing with CSV rows
 * @returns Updated running balances data
 */
export const recalculateAfterReorder = (
  reorderedTransactions: (Transaction | CSVRow)[],
  accounts: Account[],
  isCSVRows: boolean = false
): TransactionWithBalance[] => {
  return calculateRunningBalances(reorderedTransactions, accounts, isCSVRows);
};
