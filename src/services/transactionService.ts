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

// Additional analytics functions for enhanced stats

export const calculateSpendingVelocity = (
  transactions: Transaction[],
  accounts: Account[],
  days: number = 30
): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentExpenses = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionType = getTransactionType(transaction, accounts);
    return transactionDate >= cutoffDate && transactionType === 'expense';
  });

  const totalExpenses = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
  return totalExpenses / days;
};

export const findLargestExpenseCategory = (
  transactions: Transaction[],
  accounts: Account[],
  year?: number,
  month?: number
): CategoryStats | null => {
  const categoryStats = calculateCategoryStats(transactions, accounts, year, month);
  return categoryStats.length > 0 ? categoryStats[0] : null;
};

export const calculateSavingsRate = (
  transactions: Transaction[],
  accounts: Account[],
  year?: number,
  month?: number
): number => {
  const totals = calculateTransactionTotals(
    year !== undefined || month !== undefined 
      ? transactions.filter(t => {
          const date = new Date(t.date);
          return (year === undefined || date.getFullYear() === year) &&
                 (month === undefined || date.getMonth() === month);
        })
      : transactions,
    accounts
  );

  if (totals.income === 0) return 0;
  return (totals.net / totals.income) * 100;
};

export const getTopExpensesByAmount = (
  transactions: Transaction[],
  accounts: Account[],
  limit: number = 5,
  year?: number,
  month?: number
): Transaction[] => {
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

  return expenseTransactions
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

// Enhanced utility functions for stats
export const getTopAccounts = (transactions: Transaction[], accounts: Account[], limit = 5) => {
  const accountTotals = transactions.reduce((acc, transaction) => {
    // Count transactions going TO an account (expenses from that account's perspective)
    acc[transaction.toAccountId] = (acc[transaction.toAccountId] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(accountTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([accountId, amount]) => ({ 
      accountId, 
      accountName: accounts.find(a => a.id === accountId)?.name || 'Unknown',
      amount 
    }));
};

export const getTransactionTrend = (transactions: Transaction[], days = 30) => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const dailyTransactions = transactions
    .filter(t => new Date(t.date) >= startDate)
    .reduce((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(dailyTransactions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
};

export const getAverageTransactionSize = (transactions: Transaction[]) => {
  if (transactions.length === 0) return 0;
  
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  return total / transactions.length;
};

export const getLargestTransactions = (transactions: Transaction[], limit = 5) => {
  return [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

export const getMonthlyComparison = (transactions: Transaction[]) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const lastMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });

  const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const lastTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    current: { total: currentTotal, count: currentMonthTransactions.length },
    last: { total: lastTotal, count: lastMonthTransactions.length },
    totalChange: lastTotal === 0 ? 0 : ((currentTotal - lastTotal) / lastTotal) * 100,
    countChange: lastMonthTransactions.length === 0 ? 0 : 
      ((currentMonthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100,
  };
};
