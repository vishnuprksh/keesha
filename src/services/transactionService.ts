import { Transaction, Account, getTransactionType } from '../types';
import { isCurrentMonth, getMonthYearKey } from '../utils/dateUtils';

// Business logic for transaction calculations and analysis

export interface TransactionTotals {
  income: number;
  expenses: number;
  transfers: number;
  net: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalExpenses: number;
  categories: CategoryStats[];
}

export const calculateTransactionTotals = (
  transactions: Transaction[], 
  accounts: Account[]
): TransactionTotals => {
  const totals = transactions.reduce(
    (acc, transaction) => {
      const transactionType = getTransactionType(transaction, accounts);
      switch (transactionType) {
        case 'income':
          acc.income += transaction.amount;
          break;
        case 'expense':
          acc.expenses += transaction.amount;
          break;
        case 'transfer':
          acc.transfers += transaction.amount;
          break;
      }
      return acc;
    },
    { income: 0, expenses: 0, transfers: 0, net: 0 }
  );

  totals.net = totals.income - totals.expenses;
  return totals;
};

export const calculateMonthlyTotals = (
  transactions: Transaction[], 
  accounts: Account[]
): TransactionTotals => {
  const monthlyTransactions = transactions.filter(transaction => 
    isCurrentMonth(transaction.date)
  );
  
  return calculateTransactionTotals(monthlyTransactions, accounts);
};

export const calculateCategoryStats = (
  transactions: Transaction[],
  accounts: Account[],
  year?: number,
  month?: number
): CategoryStats[] => {
  // Filter expense transactions
  const expenseTransactions = transactions.filter(transaction => {
    const transactionType = getTransactionType(transaction, accounts);
    if (transactionType !== 'expense') return false;

    if (year !== undefined || month !== undefined) {
      const transactionDate = new Date(transaction.date);
      if (year !== undefined && transactionDate.getFullYear() !== year) return false;
      if (month !== undefined && transactionDate.getMonth() !== month) return false;
    }

    return true;
  });

  // Group by expense account (category)
  const expenseAccounts = accounts.filter(acc => acc.type === 'expense');
  const categoryMap = new Map<string, { amount: number; count: number }>();

  expenseTransactions.forEach(transaction => {
    const expenseAccount = expenseAccounts.find(acc => acc.id === transaction.toAccountId);
    if (expenseAccount) {
      const existing = categoryMap.get(expenseAccount.name) || { amount: 0, count: 0 };
      categoryMap.set(expenseAccount.name, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    }
  });

  const totalExpenses = Array.from(categoryMap.values()).reduce(
    (sum, category) => sum + category.amount, 
    0
  );

  return Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      amount: stats.amount,
      count: stats.count,
      percentage: totalExpenses > 0 ? (stats.amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const calculateMonthlyStats = (
  transactions: Transaction[],
  accounts: Account[]
): MonthlyStats[] => {
  const monthsSet = new Set<string>();
  transactions.forEach(transaction => {
    monthsSet.add(getMonthYearKey(transaction.date));
  });

  return Array.from(monthsSet)
    .map(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      const monthTransactions = transactions.filter(t => 
        getMonthYearKey(t.date) === monthKey
      );

      const expenseTransactions = monthTransactions.filter(t =>
        getTransactionType(t, accounts) === 'expense'
      );

      const totalExpenses = expenseTransactions.reduce(
        (sum, t) => sum + t.amount, 
        0
      );

      const categories = calculateCategoryStats(transactions, accounts, year, month);

      return {
        month: new Date(year, month).toLocaleString('default', { month: 'long' }),
        year,
        totalExpenses,
        categories
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return new Date(a.year, new Date(`${a.month} 1`).getMonth()).getTime() - 
             new Date(b.year, new Date(`${b.month} 1`).getMonth()).getTime();
    });
};
