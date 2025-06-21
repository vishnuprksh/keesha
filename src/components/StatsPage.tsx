import React, { useState, useMemo } from 'react';
import { Transaction, Account, getTransactionType } from '../types';

interface StatsPageProps {
  transactions: Transaction[];
  accounts: Account[];
}

interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyStats {
  month: string;
  year: number;
  totalExpenses: number;
  categories: CategoryStats[];
}

const StatsPage: React.FC<StatsPageProps> = ({ transactions, accounts }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [viewExpanded, setViewExpanded] = useState<boolean>(false);

  // Get expense accounts (categories)
  const expenseAccounts = accounts.filter(acc => acc.type === 'expense');

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const stats: MonthlyStats[] = [];
    
    // Get all unique months/years from transactions
    const monthsSet = new Set<string>();
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthsSet.add(monthKey);
    });

    // Sort months in descending order (most recent first)
    const sortedMonths = Array.from(monthsSet).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });

    sortedMonths.forEach(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      
      // Get expense transactions for this month
      const monthExpenses = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionType = getTransactionType(transaction, accounts);
        return transactionDate.getFullYear() === year &&
               transactionDate.getMonth() === month &&
               transactionType === 'expense';
      });

      if (monthExpenses.length === 0) return;

      // Calculate category-wise expenses
      const categoryMap = new Map<string, { amount: number; count: number }>();
      let totalExpenses = 0;

      monthExpenses.forEach(transaction => {
        const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
        const categoryName = toAccount?.name || 'Other';
        
        const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
        categoryMap.set(categoryName, {
          amount: existing.amount + transaction.amount,
          count: existing.count + 1
        });
        totalExpenses += transaction.amount;
      });

      // Convert to CategoryStats array with percentages
      const categories: CategoryStats[] = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);

      stats.push({
        month: new Date(year, month).toLocaleString('default', { month: 'long' }),
        year,
        totalExpenses,
        categories
      });
    });

    return stats;
  }, [transactions, accounts]);

  // Get stats for selected month
  const selectedStats = monthlyStats.find(
    stats => stats.year === selectedYear && 
    new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }) === stats.month
  );

  // Get available years
  const availableYears = Array.from(new Set(monthlyStats.map(stats => stats.year))).sort((a, b) => b - a);

  // Get available months for selected year
  const availableMonths = monthlyStats
    .filter(stats => stats.year === selectedYear)
    .map(stats => ({
      index: new Date(`${stats.month} 1, ${stats.year}`).getMonth(),
      name: stats.month
    }))
    .sort((a, b) => b.index - a.index);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="stats-page">
      {/* Compact Header with Controls */}
      <div className="stats-compact-header">
        <div className="header-content">
          <h2>📊 Stats ({selectedStats ? formatAmount(selectedStats.totalExpenses) : '$0.00'})</h2>
          <div className="header-controls">
            <button 
              onClick={() => setViewExpanded(!viewExpanded)}
              className="btn btn-view-toggle"
              title={viewExpanded ? "Compact view" : "Detailed view"}
            >
              📈 {viewExpanded ? 'Compact' : 'Details'}
            </button>
          </div>
        </div>
        
        {/* Compact Date Controls - always visible */}
        <div className="compact-date-controls">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>📅 {year}</option>
            ))}
          </select>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {availableMonths.map(month => (
              <option key={month.index} value={month.index}>📅 {month.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStats ? (
        <>
          {/* Compact Summary Cards */}
          <div className="compact-summary-grid">
            <div className="summary-card total">
              <div className="card-content">
                <span className="card-label">Total</span>
                <span className="card-value">{formatAmount(selectedStats.totalExpenses)}</span>
              </div>
            </div>
            <div className="summary-card count">
              <div className="card-content">
                <span className="card-label">Transactions</span>
                <span className="card-value">{selectedStats.categories.reduce((sum, cat) => sum + cat.count, 0)}</span>
              </div>
            </div>
            <div className="summary-card categories">
              <div className="card-content">
                <span className="card-label">Categories</span>
                <span className="card-value">{selectedStats.categories.length}</span>
              </div>
            </div>
          </div>

          {/* Category List - Compact by default */}
          <div className="card category-breakdown-compact">
            <div className="category-list-compact">
              {selectedStats.categories.map((category, index) => (
                <div key={category.category} className="category-item-compact">
                  <div className="category-row">
                    <span className="category-name">
                      #{index + 1} {category.category}
                    </span>
                    <div className="category-stats">
                      <span className="amount">{formatAmount(category.amount)}</span>
                      <span className="percentage">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  {viewExpanded && (
                    <div className="category-details">
                      <span className="transaction-count">{category.count} transactions</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Comparison - Only show if expanded */}
          {viewExpanded && (
            <div className="card monthly-comparison-compact">
              <h4>Recent Months</h4>
              <div className="comparison-grid">
                {monthlyStats.slice(0, 4).map((monthStats) => (
                  <div 
                    key={`${monthStats.year}-${monthStats.month}`} 
                    className={`comparison-card ${monthStats.year === selectedYear && monthStats.month === getMonthName(selectedMonth) ? 'current' : ''}`}
                  >
                    <div className="month-label">{monthStats.month.slice(0, 3)} {monthStats.year}</div>
                    <div className="month-amount">{formatAmount(monthStats.totalExpenses)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card empty-stats-compact">
          <div className="empty-state">
            <span>📊 No data for {getMonthName(selectedMonth)} {selectedYear}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
