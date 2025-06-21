import React from 'react';
import { Transaction, Account, getTransactionType } from '../types';

interface TransactionSummaryProps {
  transactions: Transaction[];
  accounts: Account[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions, accounts }) => {
  const calculateTotals = () => {
    return transactions.reduce(
      (totals, transaction) => {
        const transactionType = getTransactionType(transaction, accounts);
        switch (transactionType) {
          case 'income':
            totals.income += transaction.amount;
            break;
          case 'expense':
            totals.expenses += transaction.amount;
            break;
          case 'transfer':
            totals.transfers += transaction.amount;
            break;
        }
        return totals;
      },
      { income: 0, expenses: 0, transfers: 0 }
    );
  };

  const calculateMonthlyTotals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    return monthlyTransactions.reduce(
      (totals, transaction) => {
        const transactionType = getTransactionType(transaction, accounts);
        switch (transactionType) {
          case 'income':
            totals.income += transaction.amount;
            break;
          case 'expense':
            totals.expenses += transaction.amount;
            break;
          case 'transfer':
            totals.transfers += transaction.amount;
            break;
        }
        return totals;
      },
      { income: 0, expenses: 0, transfers: 0 }
    );
  };

  const totals = calculateTotals();
  const monthlyTotals = calculateMonthlyTotals();
  const netWorth = totals.income - totals.expenses;
  const monthlyNet = monthlyTotals.income - monthlyTotals.expenses;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  };

  const getCountByType = (type: 'income' | 'expense' | 'transfer') => {
    return transactions.filter(t => getTransactionType(t, accounts) === type).length;
  };

  return (
    <div className="card transaction-summary">
      <h2>Financial Overview</h2>
      
      <div className="summary-grid">
        <div className="summary-item income">
          <div className="summary-header">
            <span className="summary-icon">📈</span>
            <h3>Total Income</h3>
          </div>
          <p className="amount">{formatAmount(totals.income)}</p>
          <span className="count">{getCountByType('income')} transactions</span>
        </div>
        
        <div className="summary-item expense">
          <div className="summary-header">
            <span className="summary-icon">📉</span>
            <h3>Total Expenses</h3>
          </div>
          <p className="amount">{formatAmount(totals.expenses)}</p>
          <span className="count">{getCountByType('expense')} transactions</span>
        </div>
        
        <div className="summary-item transfer">
          <div className="summary-header">
            <span className="summary-icon">🔄</span>
            <h3>Total Transfers</h3>
          </div>
          <p className="amount">{formatAmount(totals.transfers)}</p>
          <span className="count">{getCountByType('transfer')} transactions</span>
        </div>
        
        <div className={`summary-item net-worth ${netWorth >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-header">
            <span className="summary-icon">{netWorth >= 0 ? '💰' : '⚠️'}</span>
            <h3>Net Balance</h3>
          </div>
          <p className="amount">{formatAmount(netWorth)}</p>
          <span className="count">Income - Expenses</span>
        </div>
      </div>

      <div className="monthly-summary">
        <h3>{getMonthName()} Summary</h3>
        <div className="monthly-grid">
          <div className="monthly-item">
            <span className="label">Income:</span>
            <span className="value income">{formatAmount(monthlyTotals.income)}</span>
          </div>
          <div className="monthly-item">
            <span className="label">Expenses:</span>
            <span className="value expense">{formatAmount(monthlyTotals.expenses)}</span>
          </div>
          <div className="monthly-item">
            <span className="label">Transfers:</span>
            <span className="value transfer">{formatAmount(monthlyTotals.transfers)}</span>
          </div>
          <div className="monthly-item">
            <span className="label">Net:</span>
            <span className={`value ${monthlyNet >= 0 ? 'positive' : 'negative'}`}>
              {formatAmount(monthlyNet)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
