// Date utility functions

export const getCurrentMonth = (): number => {
  return new Date().getMonth();
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const isCurrentMonth = (date: string): boolean => {
  const transactionDate = new Date(date);
  const current = new Date();
  return (
    transactionDate.getMonth() === current.getMonth() &&
    transactionDate.getFullYear() === current.getFullYear()
  );
};

export const isDateInRange = (date: string, fromDate?: string, toDate?: string): boolean => {
  const transactionDate = new Date(date);
  
  if (fromDate && transactionDate < new Date(fromDate)) {
    return false;
  }
  
  if (toDate && transactionDate > new Date(toDate)) {
    return false;
  }
  
  return true;
};

export const getMonthYearKey = (date: string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

export const getAvailableYears = (dates: string[]): number[] => {
  const yearsSet = new Set<number>();
  dates.forEach(date => {
    yearsSet.add(new Date(date).getFullYear());
  });
  return Array.from(yearsSet).sort((a, b) => b - a);
};

export const getMonthsInDateRange = (transactions: any[]): { month: number; year: number }[] => {
  const monthsSet = new Set<string>();
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    monthsSet.add(monthKey);
  });
  
  return Array.from(monthsSet)
    .map(key => {
      const [year, month] = key.split('-');
      return { year: parseInt(year), month: parseInt(month) };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
};
