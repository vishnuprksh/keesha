import React from 'react';
import { Account } from '../../types';

export interface FilterOptions {
  search: string;
  accountId: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  status: 'all' | 'valid' | 'invalid' | 'selected' | 'unselected';
  sortBy: 'date' | 'amount' | 'title';
  sortDirection: 'asc' | 'desc';
}

interface TransactionFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  accounts: Account[];
  totalRows: number;
  filteredRows: number;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  accounts,
  totalRows,
  filteredRows
}) => {
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      accountId: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      status: 'all',
      sortBy: 'date',
      sortDirection: 'desc'
    });
  };

  return (
    <div className="transaction-filters">
      <div className="filters-header">
        <h3>Filter & Sort Transactions</h3>
        <div className="filters-summary">
          Showing {filteredRows} of {totalRows} transactions
        </div>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search title, description, or account..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Account:</label>
          <select
            value={filters.accountId}
            onChange={(e) => updateFilter('accountId', e.target.value)}
          >
            <option value="">All accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date From:</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Date To:</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Min Amount:</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filters.amountMin}
            onChange={(e) => updateFilter('amountMin', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Max Amount:</label>
          <input
            type="number"
            step="0.01"
            placeholder="999999.99"
            value={filters.amountMax}
            onChange={(e) => updateFilter('amountMax', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value as FilterOptions['status'])}
          >
            <option value="all">All transactions</option>
            <option value="valid">Valid only</option>
            <option value="invalid">Invalid only</option>
            <option value="selected">Selected only</option>
            <option value="unselected">Unselected only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value as FilterOptions['sortBy'])}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Direction:</label>
          <select
            value={filters.sortDirection}
            onChange={(e) => updateFilter('sortDirection', e.target.value as FilterOptions['sortDirection'])}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className="filters-actions">
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;
