import React, { useState } from 'react';
import { Transaction, Account, getAccountsByType, getAccountTypeColor } from '../types';

interface TransactionFormProps {
  accounts: Account[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, onAddTransaction }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.amount || !formData.fromAccountId || !formData.toAccountId) {
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      alert('From and To accounts must be different');
      return;
    }

    onAddTransaction({
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      date: formData.date,
      description: formData.description.trim()
    });

    // Reset form
    setFormData({
      title: '',
      amount: '',
      fromAccountId: '',
      toAccountId: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : '';
  };

  const getTransactionTypeLabel = () => {
    if (!formData.fromAccountId || !formData.toAccountId) return '';
    
    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
    
    if (!fromAccount || !toAccount) return '';
    
    if (fromAccount.type === 'income' && toAccount.type === 'bank') {
      return '📈 Income Transaction';
    } else if (fromAccount.type === 'bank' && toAccount.type === 'expense') {
      return '📉 Expense Transaction';
    } else {
      return '🔄 Transfer Transaction';
    }
  };

  return (
    <div className="card transaction-form">
      <h2>Add New Transaction</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title">Description</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter transaction description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fromAccountId">From Account</label>
          <select
            id="fromAccountId"
            name="fromAccountId"
            value={formData.fromAccountId}
            onChange={handleChange}
            required
          >
            <option value="">Select source account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type}) - {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(account.balance)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="toAccountId">To Account</label>
          <select
            id="toAccountId"
            name="toAccountId"
            value={formData.toAccountId}
            onChange={handleChange}
            required
          >
            <option value="">Select destination account</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.type}) - {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(account.balance)}
              </option>
            ))}
          </select>
        </div>

        {getTransactionTypeLabel() && (
          <div className="transaction-type-preview">
            <span className="type-label">{getTransactionTypeLabel()}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Notes (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add any additional notes..."
            rows={3}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
