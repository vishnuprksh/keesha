import React, { useState, useMemo } from 'react';
import { Transaction, Account, getTransactionType } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { filterTransactions, sortTransactions, TransactionFilters } from '../services/filterService';
import { exportTransactionsToCSV, generateCSVFilename } from '../utils/csvExport';
import EmptyState from './common/EmptyState';
import AccountSelect from './forms/AccountSelect';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

interface TransactionsPageProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  onToggleImportant: (id: string) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onUpdateTransaction,
  onToggleImportant
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    accountId: '',
    transactionType: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    showImportantOnly: false
  });

  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title' | 'important'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Transaction | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  const { isOpen, openDialog, closeDialog, dialogConfig } = useConfirmDialog();

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
    setFilters(prev => ({ 
      ...prev, 
      [key]: key === 'showImportantOnly' ? value === 'true' : value 
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      accountId: '',
      transactionType: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      showImportantOnly: false
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
        description: editForm.description,
        isImportant: editForm.isImportant
      });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    openDialog({
      title: 'Delete Transaction',
      message: `Are you sure you want to delete "${transaction.title}"? This action cannot be undone.`,
      onConfirm: () => {
        onDeleteTransaction(transaction.id);
        closeDialog();
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
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
      {/* Modern Header Section */}
      <div className="transactions-header">
        <div className="header-content">
          <h2>💰 Transactions</h2>
          <p>Manage and review your financial transactions</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{filteredTransactions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Important</span>
            <span className="stat-value">{filteredTransactions.filter(t => t.isImportant).length}</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="action-controls">
        <div className="control-group">
          <button 
            onClick={handleExportCSV}
            className="btn btn-primary"
            disabled={filteredTransactions.length === 0}
          >
            📤 Export CSV
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="filter-toggle-group">
          <button 
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`btn btn-filter-toggle ${filtersExpanded ? 'active' : ''}`}
          >
            🔽 {filtersExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {/* Quick Sort Controls */}
      <div className="quick-controls">
        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'title' | 'important')}>
            <option value="date">📅 Date</option>
            <option value="amount">💰 Amount</option>
            <option value="title">📝 Title</option>
            <option value="important">⭐ Important</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="desc">⬇️ Descending</option>
            <option value="asc">⬆️ Ascending</option>
          </select>
        </div>
        
        <div className="quick-filters">
          <label className="important-filter">
            <input 
              type="checkbox" 
              checked={filters.showImportantOnly} 
              onChange={(e) => handleFilterChange('showImportantOnly', e.target.checked.toString())}
            />
            <span>⭐ Important only</span>
          </label>
        </div>
      </div>

      {/* Advanced Filters Section */}
      {filtersExpanded && (
        <div className="card filters-section">
          <div className="filters-header">
            <h3>🔍 Advanced Filters</h3>
            <button onClick={clearFilters} className="btn btn-clear">
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label>🔍 Search</label>
              <input
                type="text"
                placeholder="Search titles, descriptions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>🏦 Account</label>
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>📊 Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="income">📈 Income</option>
                <option value="expense">📉 Expense</option>
                <option value="transfer">🔄 Transfer</option>
              </select>
            </div>

            <div className="filter-group">
              <label>📅 From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>📅 To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>💰 Min Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>💰 Max Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="∞"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Content */}
      <div className="transactions-content">
        {filteredTransactions.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📊"
              title="No transactions found"
              description="Try adjusting your filters or add some transactions to get started."
            />
          </div>
        ) : (
          <div className="card transactions-container">
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th className="col-star">⭐</th>
                    <th className="col-date">Date</th>
                    <th className="col-title">Title</th>
                    <th className="col-type">Type</th>
                    <th className="col-from">From</th>
                    <th className="col-to">To</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-description">Description</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => {
                    const transactionTypeInfo = getTransactionTypeDisplay(transaction);
                    
                    return (
                      <tr key={transaction.id} className={`transaction-row ${transaction.isImportant ? 'important' : ''}`}>
                        {editingId === transaction.id && editForm ? (
                          <>
                            <td>
                              <button
                                type="button"
                                onClick={() => setEditForm(prev => prev ? { ...prev, isImportant: !prev.isImportant } : null)}
                                className={`btn-star ${editForm.isImportant ? 'active' : ''}`}
                              >
                                {editForm.isImportant ? '⭐' : '☆'}
                              </button>
                            </td>
                            <td>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, date: e.target.value } : null)}
                                className="input-sm"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, title: e.target.value } : null)}
                                className="input-sm"
                              />
                            </td>
                            <td>
                              <span className="transaction-type-badge" style={{ backgroundColor: transactionTypeInfo.color }}>
                                {transactionTypeInfo.icon} {transactionTypeInfo.label}
                              </span>
                            </td>
                            <td>
                              <div className="account-select-wrapper">
                                <AccountSelect
                                  accounts={accounts}
                                  value={editForm.fromAccountId}
                                  onChange={(value) => setEditForm(prev => prev ? { ...prev, fromAccountId: value } : null)}
                                  placeholder="From Account"
                                  name={`edit-from-${editForm.id}`}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="account-select-wrapper">
                                <AccountSelect
                                  accounts={accounts}
                                  value={editForm.toAccountId}
                                  onChange={(value) => setEditForm(prev => prev ? { ...prev, toAccountId: value } : null)}
                                  placeholder="To Account"
                                  excludeAccount={editForm.fromAccountId}
                                  name={`edit-to-${editForm.id}`}
                                />
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.amount}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                                className="input-sm"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                                className="input-sm"
                                placeholder="Description..."
                              />
                            </td>
                            <td>
                              <div className="action-buttons">
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
                            <td>
                              <button
                                onClick={() => onToggleImportant(transaction.id)}
                                className={`btn-star ${transaction.isImportant ? 'active' : ''}`}
                                title={transaction.isImportant ? 'Remove from important' : 'Mark as important'}
                              >
                                {transaction.isImportant ? '⭐' : '☆'}
                              </button>
                            </td>
                            <td className="date-cell">{formatDate(transaction.date)}</td>
                            <td className="title-cell">{transaction.title}</td>
                            <td>
                              <span className="transaction-type-badge" style={{ backgroundColor: transactionTypeInfo.color }}>
                                {transactionTypeInfo.icon} {transactionTypeInfo.label}
                              </span>
                            </td>
                            <td className="account-cell">{getAccountName(transaction.fromAccountId)}</td>
                            <td className="account-cell">{getAccountName(transaction.toAccountId)}</td>
                            <td className="amount-cell">
                              <span className={`amount ${getTransactionType(transaction, accounts)}`}>
                                {formatAmount(transaction.amount)}
                              </span>
                            </td>
                            <td className="description-cell">{transaction.description || '—'}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleEdit(transaction)}
                                  className="btn btn-edit"
                                  disabled={!!editingId}
                                  title="Edit transaction"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(transaction)}
                                  className="btn btn-delete"
                                  disabled={!!editingId}
                                  title="Delete transaction"
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
          </div>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={isOpen}
        title={dialogConfig?.title || ''}
        message={dialogConfig?.message || ''}
        confirmLabel={dialogConfig?.confirmLabel || 'Confirm'}
        cancelLabel={dialogConfig?.cancelLabel || 'Cancel'}
        onConfirm={dialogConfig?.onConfirm || (() => {})}
        onCancel={closeDialog}
        type={dialogConfig?.type || 'danger'}
      />
    </div>
  );
};

export default TransactionsPage;
