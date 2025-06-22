import React, { useState } from 'react';
import { Account, AccountType, getAccountTypeColor } from '../types';
import { formatAmount } from '../utils/formatters';
import ConfirmDialog from './common/ConfirmDialog';
import { useConfirmDialog } from '../hooks/useConfirmDialog';

interface AccountManagerProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (id: string, account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as AccountType,
    balance: '0',
    description: ''
  });

  const { isOpen, openDialog, closeDialog, dialogConfig } = useConfirmDialog();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      onUpdateAccount(editingId, {
        name: formData.name.trim(),
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        description: formData.description.trim()
      });
      setEditingId(null);
    } else {
      onAddAccount({
        name: formData.name.trim(),
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        description: formData.description.trim()
      });
      setShowAddForm(false);
    }

    setFormData({ name: '', type: 'bank', balance: '0', description: '' });
  };

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      description: account.description || ''
    });
    setEditingId(account.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', type: 'bank', balance: '0', description: '' });
  };

  const handleDeleteAccount = (account: Account) => {
    openDialog({
      title: 'Delete Account',
      message: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      onConfirm: () => {
        onDeleteAccount(account.id);
        closeDialog();
      },
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
  };

  const formatBalance = (balance: number) => {
    return formatAmount(balance);
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'bank': return '🏦';
      case 'income': return '📈';
      case 'expense': return '📉';
      case 'asset': return '💎';
      case 'liability': return '💳';
      case 'transaction': return '🔄';
      default: return '💰';
    }
  };

  const groupedAccounts = accounts.reduce((groups, account) => {
    if (!groups[account.type]) {
      groups[account.type] = [];
    }
    groups[account.type].push(account);
    return groups;
  }, {} as Record<AccountType, Account[]>);

  return (
    <div className="account-manager">
      <div className="account-header">
        <h2>🏦 Account Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          disabled={showAddForm || !!editingId}
        >
          + Add Account
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="card account-form">
          <h3>{editingId ? 'Edit Account' : 'Add New Account'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Account Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter account name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Account Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AccountType }))}
                >
                  <option value="bank">Bank Account</option>
                  <option value="income">Income Account</option>
                  <option value="expense">Expense Account</option>
                  <option value="asset">Asset Account</option>
                  <option value="liability">Liability Account</option>
                  <option value="transaction">Transaction Account</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="balance">Initial Balance</label>
                <input
                  type="number"
                  id="balance"
                  value={formData.balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Account description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Account' : 'Create Account'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="account-groups">
        {Object.entries(groupedAccounts).map(([type, accountList]) => (
          <div key={type} className="account-group">
            <h3 className="group-title">
              {getAccountTypeIcon(type as AccountType)} {type.charAt(0).toUpperCase() + type.slice(1)} Accounts
            </h3>
            <div className="account-list">
              {accountList.map(account => (
                <div key={account.id} className="account-item">
                  <div className="account-info">
                    <div className="account-main">
                      <h4 className="account-name">{account.name}</h4>
                      <span 
                        className="account-balance"
                        style={{ color: getAccountTypeColor(account.type) }}
                      >
                        {formatBalance(account.balance)}
                      </span>
                    </div>
                    {account.description && (
                      <p className="account-description">{account.description}</p>
                    )}
                  </div>
                  <div className="account-actions">
                    <button
                      onClick={() => handleEdit(account)}
                      className="btn btn-edit"
                      disabled={showAddForm || !!editingId}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account)}
                      className="btn btn-delete"
                      disabled={showAddForm || !!editingId}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="account-summary">
        <h3>Account Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total Bank Accounts:</span>
            <span className="value">
              {formatBalance(
                accounts
                  .filter(acc => acc.type === 'bank')
                  .reduce((sum, acc) => sum + acc.balance, 0)
              )}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Total Assets:</span>
            <span className="value">
              {formatBalance(
                accounts
                  .filter(acc => acc.type === 'asset')
                  .reduce((sum, acc) => sum + acc.balance, 0)
              )}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Total Liabilities:</span>
            <span className="value">
              {formatBalance(
                accounts
                  .filter(acc => acc.type === 'liability')
                  .reduce((sum, acc) => sum + acc.balance, 0)
              )}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Total Transaction Accounts:</span>
            <span className="value">
              {formatBalance(
                accounts
                  .filter(acc => acc.type === 'transaction')
                  .reduce((sum, acc) => sum + acc.balance, 0)
              )}
            </span>
          </div>
        </div>
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

export default AccountManager;
