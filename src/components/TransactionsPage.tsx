import React, { useState, useMemo } from 'react';
import { Transaction, Account, getTransactionType } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { filterTransactions, sortTransactions, TransactionFilters } from '../services/filterService';
import { exportTransactionsToCSV, generateCSVFilename } from '../utils/csvExport';
import EmptyState from './common/EmptyState';

interface TransactionsPageProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    accountId: '',
    transactionType: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });

  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  // Get account name by ID
  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    const filtered = filterTransactions(transactions, accounts, filters);
    return sortTransactions(filtered, sortBy, sortOrder);
  }, [transactions, accounts, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      accountId: '',
      transactionType: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({ ...transaction });
  };

  const handleSaveEdit = () => {
    if (editForm && editingId) {
      onUpdateTransaction(editingId, {
        title: editForm.title,
        amount: editForm.amount,
        fromAccountId: editForm.fromAccountId,
        toAccountId: editForm.toAccountId,
        date: editForm.date,
        description: editForm.description
      });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const getTransactionTypeDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction, accounts);
    
    switch (type) {
      case 'income':
        return { label: 'Income', color: '#28a745', icon: '📈' };
      case 'expense':
        return { label: 'Expense', color: '#dc3545', icon: '📉' };
      default:
        return { label: 'Transfer', color: '#007bff', icon: '🔄' };
    }
  };

  const handleExportCSV = () => {
    const filename = generateCSVFilename(filteredTransactions);
    exportTransactionsToCSV(filteredTransactions, accounts, filename);
  };

  return (
    <div className="transactions-page">
      {/* Compact Header with Filters Toggle */}
      <div className="transactions-compact-header">
        <div className="header-content">
          <h2>💰 Transactions ({filteredTransactions.length})</h2>
          <div className="header-controls">
            <button 
              onClick={handleExportCSV}
              className="btn btn-export"
              title="Export transactions to CSV"
              style={{ marginRight: '8px' }}
              disabled={filteredTransactions.length === 0}
            >
              📤 Export CSV
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-refresh"
              title="Refresh data"
              style={{ marginRight: '8px' }}
            >
              🔄 Refresh
            </button>
            <button 
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="btn btn-filter-toggle"
              title={filtersExpanded ? "Hide filters" : "Show filters"}
            >
              🔽 {filtersExpanded ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>
        
        {/* Compact Sort Controls - always visible */}
        <div className="compact-sort-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'title')}>
            <option value="date">📅 Date</option>
            <option value="amount">💰 Amount</option>
            <option value="title">📝 Title</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="desc">⬇️ Desc</option>
            <option value="asc">⬆️ Asc</option>
          </select>
        </div>
      </div>

      {/* Collapsible Filters */}
      {filtersExpanded && (
        <div className="card filters-section collapsed">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Account</label>
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
              >
                <option value="">All</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              >
                <option value="">All</option>
                <option value="income">📈 Income</option>
                <option value="expense">📉 Expense</option>
                <option value="transfer">🔄 Transfer</option>
              </select>
            </div>

            <div className="filter-group">
              <label>From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Min $</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Max $</label>
              <input
                type="number"
                step="0.01"
                placeholder="∞"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card transactions-table-container">
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon="📊"
            title="No transactions found"
            description="Try adjusting your filters or add some transactions to get started."
          />
        ) : (
          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(transaction => {
                  const transactionTypeInfo = getTransactionTypeDisplay(transaction);
                  
                  return (
                    <tr key={transaction.id}>
                      {editingId === transaction.id && editForm ? (
                        <>
                          <td>
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, date: e.target.value } : null)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, title: e.target.value } : null)}
                            />
                          </td>
                          <td>
                            <span style={{ color: transactionTypeInfo.color }}>
                              {transactionTypeInfo.icon} {transactionTypeInfo.label}
                            </span>
                          </td>
                          <td>
                            <select
                              value={editForm.fromAccountId}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, fromAccountId: e.target.value } : null)}
                            >
                              {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                  {account.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              value={editForm.toAccountId}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, toAccountId: e.target.value } : null)}
                            >
                              {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                  {account.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                            />
                          </td>
                          <td>
                            <div className="edit-actions">
                              <button onClick={handleSaveEdit} className="btn btn-save">
                                ✓
                              </button>
                              <button onClick={handleCancelEdit} className="btn btn-cancel">
                                ✕
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{formatDate(transaction.date)}</td>
                          <td className="transaction-title">{transaction.title}</td>
                          <td>
                            <span className="transaction-type" style={{ color: transactionTypeInfo.color }}>
                              {transactionTypeInfo.icon} {transactionTypeInfo.label}
                            </span>
                          </td>
                          <td className="account-name">{getAccountName(transaction.fromAccountId)}</td>
                          <td className="account-name">{getAccountName(transaction.toAccountId)}</td>
                          <td className="transaction-amount">{formatAmount(transaction.amount)}</td>
                          <td className="transaction-description">{transaction.description || '—'}</td>
                          <td>
                            <div className="transaction-actions">
                              <button
                                onClick={() => handleEdit(transaction)}
                                className="btn btn-edit"
                                disabled={!!editingId}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => onDeleteTransaction(transaction.id)}
                                className="btn btn-delete"
                                disabled={!!editingId}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
