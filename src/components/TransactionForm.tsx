import React, { useState } from 'react';
import { Transaction, Account } from '../types';
import { validateTransactionForm } from '../utils/validation';
import { useFormValidation } from '../hooks/useFormValidation';
import AccountSelect from './forms/AccountSelect';
import AmountInput from './forms/AmountInput';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';

interface TransactionFormProps {
  accounts: Account[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, onAddTransaction }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const initialValues = {
    title: '',
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isImportant: false
  };

  const {
    values: formData,
    isValid,
    setValue,
    validateForm,
    reset,
    getFieldError
  } = useFormValidation({
    initialValues,
    validate: validateTransactionForm
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      setSubmitError('From and To accounts must be different');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTransaction({
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        date: formData.date,
        description: formData.description.trim(),
        isImportant: formData.isImportant
      });

      // Reset form only on successful submission
      reset();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionPreview = () => {
    if (!formData.fromAccountId || !formData.toAccountId) return '';
    
    const fromAccount = accounts.find(acc => acc.id === formData.fromAccountId);
    const toAccount = accounts.find(acc => acc.id === formData.toAccountId);
    
    if (!fromAccount || !toAccount) return '';
    
    // Determine transaction type based on account types
    if (fromAccount.type === 'income' && toAccount.type === 'bank') {
      return '📈 Income Transaction';
    } else if (fromAccount.type === 'bank' && toAccount.type === 'expense') {
      return '📉 Expense Transaction';
    } else {
      return '🔄 Transfer Transaction';
    }
  };

  return (
    <div className="card expense-form">
      <h2>Add New Transaction</h2>
      
      {submitError && (
        <ErrorMessage 
          message={submitError} 
          onDismiss={() => setSubmitError(null)} 
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Description *
            {getFieldError('title') && (
              <span style={{ color: '#dc3545', marginLeft: '0.5rem' }}>
                {getFieldError('title')}
              </span>
            )}
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setValue('title', e.target.value)}
            placeholder="Transaction description"
            required
            disabled={isSubmitting}
          />
        </div>

        <AmountInput
          value={formData.amount}
          onChange={(value) => setValue('amount', value)}
          label="Amount"
          name="amount"
          required
          disabled={isSubmitting}
        />

        <AccountSelect
          accounts={accounts}
          value={formData.fromAccountId}
          onChange={(value) => setValue('fromAccountId', value)}
          label="From Account"
          name="fromAccountId"
          placeholder="Select source account"
          required
          disabled={isSubmitting}
        />

        <AccountSelect
          accounts={accounts}
          value={formData.toAccountId}
          onChange={(value) => setValue('toAccountId', value)}
          label="To Account"
          name="toAccountId"
          placeholder="Select destination account"
          excludeAccount={formData.fromAccountId}
          required
          disabled={isSubmitting}
        />

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setValue('date', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Notes (Optional)</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setValue('description', e.target.value)}
            placeholder="Additional notes..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isImportant}
              onChange={(e) => setValue('isImportant', e.target.checked)}
              disabled={isSubmitting}
            />
            <span>⭐ Mark as important</span>
          </label>
        </div>

        {getTransactionPreview() && (
          <div style={{
            padding: '0.75rem',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {getTransactionPreview()}
          </div>
        )}

        <button 
          type="submit" 
          className="btn"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" text="Adding..." />
          ) : (
            'Add Transaction'
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;