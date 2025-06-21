import React from 'react';
import { Transaction, Account, getTransactionType } from '../types';
import { calculateTransactionTotals, calculateMonthlyTotals } from '../services/transactionService';
import { formatAmount, formatMonthName } from '../utils/formatters';

interface TransactionSummaryProps {
  transactions: Transaction[];
  accounts: Account[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions, accounts }) => {
  const totals = calculateTransactionTotals(transactions, accounts);
  const monthlyTotals = calculateMonthlyTotals(transactions, accounts);
  const netWorth = totals.net;
  const monthlyNet = monthlyTotals.net;

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
        <h3>{formatMonthName()} Summary</h3>
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
