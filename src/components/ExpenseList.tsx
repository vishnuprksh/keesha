import React, { useState } from 'react';
import { Expense, EXPENSE_CATEGORIES } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
}

interface EditingExpense {
  id: string;
  title: string;
  amount: string;
  category: string;
  date: string;
  description: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
  onUpdateExpense
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingExpense | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm({
      id: expense.id,
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      description: expense.description || ''
    });
  };

  const handleSave = () => {
    if (!editForm || !editForm.title.trim() || !editForm.amount) {
      return;
    }

    onUpdateExpense(editForm.id, {
      title: editForm.title.trim(),
      amount: parseFloat(editForm.amount),
      category: editForm.category,
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

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editForm) return;
    
    const { name, value } = e.target;
    setEditForm(prev => prev ? {
      ...prev,
      [name]: value
    } : null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (expenses.length === 0) {
    return (
      <div className="card expense-list">
        <h2>Recent Expenses</h2>
        <div className="empty-state">
          <h3>No expenses yet</h3>
          <p>Start tracking your expenses by adding your first expense!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card expense-list">
      <h2>Recent Expenses</h2>
      {expenses.map(expense => (
        <div key={expense.id} className="expense-item">
          {editingId === expense.id && editForm ? (
            <div className="edit-form">
              <div className="form-group">
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  placeholder="Title"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="amount"
                  value={editForm.amount}
                  onChange={handleEditChange}
                  placeholder="Amount"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                />
              </div>
              <div className="edit-actions">
                <button className="btn btn-save" onClick={handleSave}>
                  Save
                </button>
                <button className="btn btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="expense-item-header">
                <div className="expense-item-info">
                  <h3>{expense.title}</h3>
                  <span className="category">{expense.category}</span>
                </div>
                <div className="expense-amount">
                  {formatAmount(expense.amount)}
                </div>
              </div>
              
              {expense.description && (
                <div className="expense-description">
                  {expense.description}
                </div>
              )}
              
              <div className="expense-item-details">
                <span className="expense-date">
                  {formatDate(expense.date)}
                </span>
                <div className="expense-actions">
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => onDeleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
