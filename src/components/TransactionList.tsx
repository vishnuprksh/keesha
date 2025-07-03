import React, { useState, useMemo } from 'react';
import { Transaction, Account, getTransactionType } from '../types';
import { formatAmount, formatDate } from '../utils/formatters';
import { calculateRunningBalances } from '../utils/balanceCalculator';
import EmptyState from './common/EmptyState';
import AccountSelect from './forms/AccountSelect';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
}

interface EditingTransaction {
  id: string;
  title: string;
  amount: string;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  description: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  onDeleteTransaction,
  onUpdateTransaction
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingTransaction | null>(null);

  const { isOpen, openDialog, closeDialog, dialogConfig } = useConfirmDialog();

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      id: transaction.id,
      title: transaction.title,
      amount: transaction.amount.toString(),
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      date: transaction.date,
      description: transaction.description || ''
    });
  };

  const handleSave = () => {
    if (!editForm || !editForm.title.trim() || !editForm.amount || !editForm.fromAccountId || !editForm.toAccountId) {
      return;
    }

    if (editForm.fromAccountId === editForm.toAccountId) {
      alert('From and To accounts must be different');
      return;
    }

    onUpdateTransaction(editForm.id, {
      title: editForm.title.trim(),
      amount: parseFloat(editForm.amount),
      fromAccountId: editForm.fromAccountId,
      toAccountId: editForm.toAccountId,
      date: editForm.date,
      description: editForm.description.trim()
    });

    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // Calculate running balances for transactions
  const transactionsWithBalances = useMemo(() => {
    return calculateRunningBalances(transactions, accounts);
  }, [transactions, accounts]);

  // Helper function to get account balance after a specific transaction
  const getAccountBalanceAfterTransaction = (transactionId: string, accountId: string): number | null => {
    const transactionWithBalance = transactionsWithBalances.find(twb => 
      (twb.transaction as Transaction).id === transactionId
    );
    
    if (transactionWithBalance && transactionWithBalance.runningBalances[accountId] !== undefined) {
      return transactionWithBalance.runningBalances[accountId];
    }
    
    return null;
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editForm) return;

    const { name, value } = e.target;
    setEditForm(prev => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getTransactionTypeDisplay = (transaction: Transaction) => {
    const transactionType = getTransactionType(transaction, accounts);
    switch (transactionType) {
      case 'income':
        return { icon: '📈', label: 'Income', color: '#28a745' };
      case 'expense':
        return { icon: '📉', label: 'Expense', color: '#dc3545' };
      case 'transfer':
        return { icon: '🔄', label: 'Transfer', color: '#007bff' };
      default:
        return { icon: '💰', label: 'Transaction', color: '#6c757d' };
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="card transaction-list">
        <h2>Recent Transactions</h2>
        <EmptyState
          icon="💸"
          title="No transactions yet"
          description="Add your first transaction to get started!"
        />
      </div>
    );
  }

  return (
    <div className="card transaction-list">
      <h2>Recent Transactions ({Math.min(transactions.length, 5)})</h2>
      <div className="transaction-items">
        {transactions.slice(0, 5).map(transaction => {
          const typeDisplay = getTransactionTypeDisplay(transaction);
          return (
            <div key={transaction.id} className={`transaction-item ${typeDisplay.label.toLowerCase()}`}>
              {editingId === transaction.id && editForm ? (
                <div className="edit-form">
                  <div className="edit-header">
                    <h4>Edit Transaction</h4>
                    <div className="edit-actions">
                      <button onClick={handleSave} className="btn btn-save">
                        Save
                      </button>
                      <button onClick={handleCancel} className="btn btn-cancel">
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="edit-fields">
                    <div className="field-group">
                      <label>Description</label>
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="field-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        name="amount"
                        value={editForm.amount}
                        onChange={handleEditChange}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="field-group">
                      <label>From Account</label>
                      <AccountSelect
                        accounts={accounts}
                        value={editForm.fromAccountId}
                        onChange={(value) => setEditForm(prev => prev ? { ...prev, fromAccountId: value } : null)}
                        placeholder="Select source account"
                        name="fromAccountId"
                      />
                    </div>

                    <div className="field-group">
                      <label>To Account</label>
                      <AccountSelect
                        accounts={accounts}
                        value={editForm.toAccountId}
                        onChange={(value) => setEditForm(prev => prev ? { ...prev, toAccountId: value } : null)}
                        placeholder="Select destination account"
                        excludeAccount={editForm.fromAccountId}
                        name="toAccountId"
                      />
                    </div>

                    <div className="field-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="field-group">
                      <label>Notes</label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="transaction-header">
                    <div className="transaction-type">
                      <span 
                        className="type-badge"
                        style={{ backgroundColor: typeDisplay.color }}
                      >
                        {typeDisplay.icon} {typeDisplay.label}
                      </span>
                    </div>
                    <div className="transaction-actions">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="btn btn-edit"
                        title="Edit transaction"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="btn btn-delete"
                        title="Delete transaction"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="transaction-content">
                    <div className="transaction-main">
                      <h4 className="transaction-title">{transaction.title}</h4>
                      <span 
                        className="transaction-amount"
                        style={{ color: typeDisplay.color }}
                      >
                        {formatAmount(transaction.amount)}
                      </span>
                    </div>

                    <div className="transaction-details">
                      <div className="transaction-meta">
                        <div className="account-flow">
                          <span className="from-account">
                            From: {getAccountName(transaction.fromAccountId)}
                          </span>
                          <span className="flow-arrow">→</span>
                          <span className="to-account">
                            To: {getAccountName(transaction.toAccountId)}
                          </span>
                        </div>
                        <span className="date">{formatDate(transaction.date)}</span>
                      </div>
                      {transaction.description && (
                        <p className="description">{transaction.description}</p>
                      )}
                      <div className="account-balances">
                        {(() => {
                          const fromBalance = getAccountBalanceAfterTransaction(transaction.id, transaction.fromAccountId);
                          const toBalance = getAccountBalanceAfterTransaction(transaction.id, transaction.toAccountId);
                          return (
                            <div className="balance-display">
                              {fromBalance !== null && (
                                <div className="balance-item">
                                  <span className="balance-label">{getAccountName(transaction.fromAccountId)}:</span>
                                  <span className="balance-value">{formatAmount(fromBalance)}</span>
                                </div>
                              )}
                              {toBalance !== null && transaction.fromAccountId !== transaction.toAccountId && (
                                <div className="balance-item">
                                  <span className="balance-label">{getAccountName(transaction.toAccountId)}:</span>
                                  <span className="balance-value">{formatAmount(toBalance)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
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

export default TransactionList;
