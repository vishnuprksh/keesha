import { CSVRow, Account } from '../types';
import { FilterOptions } from '../components/common/TransactionFilters';

export const filterAndSortCSVData = (
  data: CSVRow[],
  filters: FilterOptions,
  accounts: Account[]
): CSVRow[] => {
  let filteredData = [...data];

  // Apply search filter
  if (filters.search.trim()) {
    const searchLower = filters.search.toLowerCase();
    filteredData = filteredData.filter(row => {
      const titleMatch = row.title.toLowerCase().includes(searchLower);
      const descriptionMatch = row.description.toLowerCase().includes(searchLower);
      
      // Check account names
      const fromAccount = accounts.find(acc => acc.id === row.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === row.toAccountId);
      const fromAccountMatch = fromAccount?.name.toLowerCase().includes(searchLower) || false;
      const toAccountMatch = toAccount?.name.toLowerCase().includes(searchLower) || false;
      
      return titleMatch || descriptionMatch || fromAccountMatch || toAccountMatch;
    });
  }

  // Apply account filter
  if (filters.accountId) {
    filteredData = filteredData.filter(row => 
      row.fromAccountId === filters.accountId || row.toAccountId === filters.accountId
    );
  }

  // Apply date filters
  if (filters.dateFrom) {
    filteredData = filteredData.filter(row => row.date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    filteredData = filteredData.filter(row => row.date <= filters.dateTo);
  }

  // Apply amount filters
  if (filters.amountMin) {
    const minAmount = parseFloat(filters.amountMin);
    if (!isNaN(minAmount)) {
      filteredData = filteredData.filter(row => {
        const amount = parseFloat(row.amount);
        return !isNaN(amount) && amount >= minAmount;
      });
    }
  }
  if (filters.amountMax) {
    const maxAmount = parseFloat(filters.amountMax);
    if (!isNaN(maxAmount)) {
      filteredData = filteredData.filter(row => {
        const amount = parseFloat(row.amount);
        return !isNaN(amount) && amount <= maxAmount;
      });
    }
  }

  // Apply status filter
  if (filters.status !== 'all') {
    switch (filters.status) {
      case 'valid':
        filteredData = filteredData.filter(row => row.isValid);
        break;
      case 'invalid':
        filteredData = filteredData.filter(row => !row.isValid);
        break;
      case 'selected':
        filteredData = filteredData.filter(row => row.selected);
        break;
      case 'unselected':
        filteredData = filteredData.filter(row => !row.selected);
        break;
    }
  }

  // Apply sorting
  filteredData.sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        const amountA = parseFloat(a.amount) || 0;
        const amountB = parseFloat(b.amount) || 0;
        comparison = amountA - amountB;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }
    
    return filters.sortDirection === 'desc' ? -comparison : comparison;
  });

  return filteredData;
};
