import React from 'react';
import { Expense } from '../types';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="card expense-summary">
      <div className="summary-grid">
        <div className="summary-item total">
          <h3>Total Expenses</h3>
          <p>{formatAmount(totalExpenses)}</p>
        </div>
        
        <div className="summary-item">
          <h3>{getMonthName()} Expenses</h3>
          <p>{formatAmount(monthlyTotal)}</p>
        </div>
        
        <div className="summary-item count">
          <h3>Total Transactions</h3>
          <p>{expenses.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
