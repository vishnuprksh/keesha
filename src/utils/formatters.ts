// Utility functions for formatting data

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatShortDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatMonthName = (monthIndex?: number): string => {
  const month = monthIndex !== undefined ? monthIndex : new Date().getMonth();
  return new Date(2000, month).toLocaleString('default', { month: 'long' });
};

export const formatBalance = (balance: number): string => {
  const sign = balance >= 0 ? '+' : '';
  return `${sign}${formatAmount(balance)}`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatPercentageValue = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};
