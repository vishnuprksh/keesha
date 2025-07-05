import React, { useState, useMemo } from 'react';
import { Transaction, Account, getTransactionType } from '../types';
import { formatAmount, formatPercentageValue } from '../utils/formatters';
import { calculateCategoryStats, calculateTransactionTotals, getTopAccounts, getTransactionTrend, getAverageTransactionSize, getLargestTransactions, getMonthlyComparison } from '../services/transactionService';

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
  totalIncome: number;
  net: number;
  categories: CategoryStats[];
  transactionCount: number;
  averageTransaction: number;
}

interface YearlyStats {
  year: number;
  totalExpenses: number;
  totalIncome: number;
  net: number;
  monthlyAverage: number;
  transactionCount: number;
}

type TimeFrameType = 'month' | 'year' | 'quarter' | 'all';
type ViewType = 'overview' | 'categories' | 'trends' | 'comparison';

const StatsPage: React.FC<StatsPageProps> = ({ transactions, accounts }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [timeFrame, setTimeFrame] = useState<TimeFrameType>('month');
  const [activeView, setActiveView] = useState<ViewType>('overview');

  // Enhanced monthly statistics calculation
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
      
      // Get all transactions for this month
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
      });

      if (monthTransactions.length === 0) return;

      // Calculate totals for the month
      const monthTotals = calculateTransactionTotals(monthTransactions, accounts);
      const categories = calculateCategoryStats(transactions, accounts, year, month);
      
      const averageTransaction = monthTransactions.length > 0 
        ? monthTotals.expenses / monthTransactions.filter(t => getTransactionType(t, accounts) === 'expense').length 
        : 0;

      stats.push({
        month: new Date(year, month).toLocaleString('default', { month: 'long' }),
        year,
        totalExpenses: monthTotals.expenses,
        totalIncome: monthTotals.income,
        net: monthTotals.net,
        categories,
        transactionCount: monthTransactions.length,
        averageTransaction: isNaN(averageTransaction) ? 0 : averageTransaction
      });
    });

    return stats;
  }, [transactions, accounts]);

  // Yearly statistics calculation
  const yearlyStats = useMemo(() => {
    const stats: YearlyStats[] = [];
    const years = Array.from(new Set(monthlyStats.map(ms => ms.year))).sort((a, b) => b - a);

    years.forEach(year => {
      const yearMonths = monthlyStats.filter(ms => ms.year === year);
      const totalExpenses = yearMonths.reduce((sum, ms) => sum + ms.totalExpenses, 0);
      const totalIncome = yearMonths.reduce((sum, ms) => sum + ms.totalIncome, 0);
      const net = totalIncome - totalExpenses;
      const transactionCount = yearMonths.reduce((sum, ms) => sum + ms.transactionCount, 0);
      const monthlyAverage = yearMonths.length > 0 ? totalExpenses / yearMonths.length : 0;

      stats.push({
        year,
        totalExpenses,
        totalIncome,
        net,
        monthlyAverage,
        transactionCount
      });
    });

    return stats;
  }, [monthlyStats]);

  // Get current period stats
  const currentStats = timeFrame === 'year' 
    ? yearlyStats.find(ys => ys.year === selectedYear)
    : monthlyStats.find(ms => ms.year === selectedYear && 
        new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }) === ms.month);

  // Get selected month stats for detailed view
  const selectedMonthStats = monthlyStats.find(
    stats => stats.year === selectedYear && 
    new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }) === stats.month
  );

  // Calculate trends (last 6 months)
  const trendData = useMemo(() => {
    const last6Months = monthlyStats.slice(0, 6).reverse();
    return last6Months.map((month, index) => ({
      ...month,
      trend: index > 0 ? ((month.totalExpenses - last6Months[index - 1].totalExpenses) / last6Months[index - 1].totalExpenses) * 100 : 0
    }));
  }, [monthlyStats]);

  // Get available years and months
  const availableYears = Array.from(new Set(monthlyStats.map(stats => stats.year))).sort((a, b) => b - a);
  const availableMonths = monthlyStats
    .filter(stats => stats.year === selectedYear)
    .map(stats => ({
      index: new Date(`${stats.month} 1, ${stats.year}`).getMonth(),
      name: stats.month
    }))
    .sort((a, b) => b.index - a.index);

  const getMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex).toLocaleString('default', { month: 'long' });
  };

  // Enhanced statistics using new utility functions
  const enhancedStats = useMemo(() => {
    const topAccounts = getTopAccounts(transactions, accounts, 5);
    const transactionTrend = getTransactionTrend(transactions, 30);
    const averageSize = getAverageTransactionSize(transactions);
    const largestTransactions = getLargestTransactions(transactions, 5);
    const monthlyComparison = getMonthlyComparison(transactions);

    return {
      topAccounts,
      transactionTrend,
      averageSize,
      largestTransactions,
      monthlyComparison
    };
  }, [transactions, accounts]);

  const renderOverviewView = () => (
    <div className="stats-overview">
      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card income">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Income</h3>
            <div className="metric-value">{formatAmount(currentStats?.totalIncome || 0)}</div>
            {timeFrame === 'month' && selectedMonthStats && (
              <div className="metric-detail">{selectedMonthStats.transactionCount} transactions</div>
            )}
          </div>
        </div>

        <div className="metric-card expenses">
          <div className="metric-icon">💸</div>
          <div className="metric-content">
            <h3>Expenses</h3>
            <div className="metric-value">{formatAmount(currentStats?.totalExpenses || 0)}</div>
            {timeFrame === 'month' && selectedMonthStats && (
              <div className="metric-detail">Avg: {formatAmount(selectedMonthStats.averageTransaction)}</div>
            )}
          </div>
        </div>

        <div className={`metric-card net ${(currentStats?.net || 0) >= 0 ? 'positive' : 'negative'}`}>
          <div className="metric-icon">{(currentStats?.net || 0) >= 0 ? '📈' : '📉'}</div>
          <div className="metric-content">
            <h3>Net</h3>
            <div className="metric-value">{formatAmount(currentStats?.net || 0)}</div>
            <div className="metric-detail">
              {currentStats?.net && currentStats.totalIncome > 0 
                ? `${formatPercentageValue((currentStats.net / currentStats.totalIncome) * 100)} saved`
                : 'No income data'
              }
            </div>
          </div>
        </div>

        {timeFrame === 'year' && (
          <div className="metric-card average">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>Monthly Avg</h3>
              <div className="metric-value">{formatAmount((currentStats as YearlyStats)?.monthlyAverage || 0)}</div>
              <div className="metric-detail">{(currentStats as YearlyStats)?.transactionCount || 0} total transactions</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Insights */}
      <div className="insights-section">
        <h3>📋 Quick Insights</h3>
        <div className="insights-grid">
          {selectedMonthStats && selectedMonthStats.categories.length > 0 && (
            <div className="insight-card">
              <h4>Top Expense Category</h4>
              <div className="insight-content">
                <span className="category-name">{selectedMonthStats.categories[0].category}</span>
                <span className="category-amount">{formatAmount(selectedMonthStats.categories[0].amount)}</span>
                <span className="category-percentage">{formatPercentageValue(selectedMonthStats.categories[0].percentage)} of expenses</span>
              </div>
            </div>
          )}

          {trendData.length >= 2 && (
            <div className="insight-card">
              <h4>Spending Trend</h4>
              <div className="insight-content">
                <span className={`trend-value ${trendData[trendData.length - 1].trend >= 0 ? 'negative' : 'positive'}`}>
                  {trendData[trendData.length - 1].trend >= 0 ? '↗️' : '↘️'} 
                  {formatPercentageValue(Math.abs(trendData[trendData.length - 1].trend))}
                </span>
                <span className="trend-description">vs last month</span>
              </div>
            </div>
          )}

          {selectedMonthStats && (
            <div className="insight-card">
              <h4>Transaction Activity</h4>
              <div className="insight-content">
                <span className="activity-count">{selectedMonthStats.transactionCount}</span>
                <span className="activity-description">total transactions</span>
                <span className="activity-average">
                  ~{Math.round(selectedMonthStats.transactionCount / 30)} per day
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Statistics Sections */}
        <div className="enhanced-stats-grid">
          {/* Top Accounts */}
          <div className="stats-card">
            <h3>Top Active Accounts</h3>
            <div className="top-accounts-list">
              {enhancedStats.topAccounts.map((account, index) => (
                <div key={account.accountId} className="account-item">
                  <span className="account-rank">#{index + 1}</span>
                  <span className="account-name">{account.accountName}</span>
                  <span className="account-amount">{formatAmount(account.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Trend Chart */}
          <div className="stats-card">
            <h3>30-Day Transaction Trend</h3>
            <div className="trend-chart">
              {enhancedStats.transactionTrend.slice(-7).map((day, index) => (
                <div key={day.date} className="trend-bar">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${(day.amount / Math.max(...enhancedStats.transactionTrend.map(d => d.amount))) * 100}%` 
                    }}
                  ></div>
                  <span className="bar-label">{new Date(day.date).getDate()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="stats-card">
            <h3>Monthly Comparison</h3>
            <div className="comparison-content">
              <div className="comparison-row">
                <span>This Month:</span>
                <span className="amount">{formatAmount(enhancedStats.monthlyComparison.current.total)}</span>
              </div>
              <div className="comparison-row">
                <span>Last Month:</span>
                <span className="amount">{formatAmount(enhancedStats.monthlyComparison.last.total)}</span>
              </div>
              <div className="comparison-change">
                <span className={`change-value ${enhancedStats.monthlyComparison.totalChange >= 0 ? 'positive' : 'negative'}`}>
                  {enhancedStats.monthlyComparison.totalChange >= 0 ? '↗️' : '↘️'} 
                  {formatPercentageValue(Math.abs(enhancedStats.monthlyComparison.totalChange))} change
                </span>
              </div>
            </div>
          </div>

          {/* Largest Transactions */}
          <div className="stats-card">
            <h3>Largest Transactions</h3>
            <div className="large-transactions-list">
              {enhancedStats.largestTransactions.map((transaction, index) => (
                <div key={transaction.id} className="transaction-item">
                  <span className="transaction-rank">#{index + 1}</span>
                  <div className="transaction-details">
                    <span className="transaction-title">{transaction.title}</span>
                    <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                  <span className="transaction-amount">{formatAmount(transaction.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Average Transaction Size */}
          <div className="stats-card">
            <h3>Transaction Analytics</h3>
            <div className="analytics-content">
              <div className="analytic-item">
                <span className="analytic-label">Average Transaction:</span>
                <span className="analytic-value">{formatAmount(enhancedStats.averageSize)}</span>
              </div>
              <div className="analytic-item">
                <span className="analytic-label">Total Transactions:</span>
                <span className="analytic-value">{transactions.length}</span>
              </div>
              <div className="analytic-item">
                <span className="analytic-label">This Month Count:</span>
                <span className="analytic-value">{enhancedStats.monthlyComparison.current.count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCategoriesView = () => (
    <div className="categories-analysis">
      <h3>📊 Category Breakdown</h3>
      {selectedMonthStats && selectedMonthStats.categories.length > 0 ? (
        <div className="categories-container">
          <div className="categories-chart">
            {selectedMonthStats.categories.map((category, index) => (
              <div key={category.category} className="category-bar-item">
                <div className="category-info">
                  <span className="category-name">#{index + 1} {category.category}</span>
                  <span className="category-stats">
                    {formatAmount(category.amount)} ({formatPercentageValue(category.percentage)})
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill" 
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: `hsl(${220 + (index * 40)}, 70%, 60%)`
                    }}
                  ></div>
                </div>
                <div className="category-details">
                  <span className="transaction-count">{category.count} transactions</span>
                  <span className="average-amount">
                    Avg: {formatAmount(category.amount / category.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span>📊 No expense data available for the selected period</span>
        </div>
      )}
    </div>
  );

  const renderTrendsView = () => (
    <div className="trends-analysis">
      <h3>📈 Spending Trends</h3>
      {trendData.length > 0 ? (
        <div className="trends-container">
          <div className="trend-chart">
            {trendData.map((month, index) => (
              <div key={`${month.year}-${month.month}`} className="trend-item">
                <div className="trend-bar-container">
                  <div 
                    className="trend-bar" 
                    style={{ 
                      height: `${Math.min((month.totalExpenses / Math.max(...trendData.map(m => m.totalExpenses))) * 100, 100)}%`,
                      backgroundColor: month.totalExpenses > (trendData[index - 1]?.totalExpenses || 0) ? '#ff6b6b' : '#51cf66'
                    }}
                  ></div>
                </div>
                <div className="trend-info">
                  <div className="trend-month">{month.month.slice(0, 3)}</div>
                  <div className="trend-amount">{formatAmount(month.totalExpenses)}</div>
                  {index > 0 && (
                    <div className={`trend-change ${month.trend >= 0 ? 'negative' : 'positive'}`}>
                      {month.trend >= 0 ? '↗️' : '↘️'} {formatPercentageValue(Math.abs(month.trend))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span>📈 Insufficient data for trend analysis</span>
        </div>
      )}
    </div>
  );

  const renderComparisonView = () => (
    <div className="comparison-analysis">
      <h3>⚖️ Period Comparison</h3>
      <div className="comparison-grid">
        {monthlyStats.slice(0, 6).map((month, index) => (
          <div 
            key={`${month.year}-${month.month}`} 
            className={`comparison-card ${
              month.year === selectedYear && month.month === getMonthName(selectedMonth) ? 'current' : ''
            }`}
          >
            <div className="comparison-header">
              <h4>{month.month} {month.year}</h4>
            </div>
            <div className="comparison-metrics">
              <div className="comparison-metric">
                <span className="metric-label">Expenses</span>
                <span className="metric-value">{formatAmount(month.totalExpenses)}</span>
              </div>
              <div className="comparison-metric">
                <span className="metric-label">Income</span>
                <span className="metric-value">{formatAmount(month.totalIncome)}</span>
              </div>
              <div className={`comparison-metric ${month.net >= 0 ? 'positive' : 'negative'}`}>
                <span className="metric-label">Net</span>
                <span className="metric-value">{formatAmount(month.net)}</span>
              </div>
            </div>
            <div className="comparison-details">
              <div className="detail-item">
                <span>{month.transactionCount} transactions</span>
              </div>
              <div className="detail-item">
                <span>Avg: {formatAmount(month.averageTransaction)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="stats-page">
      {/* Enhanced Header */}
      <div className="stats-header">
        <div className="header-main">
          <h1>📊 Financial Analytics</h1>
          <div className="header-summary">
            {timeFrame === 'month' 
              ? `${getMonthName(selectedMonth)} ${selectedYear}` 
              : `Year ${selectedYear}`
            } • {formatAmount(currentStats?.totalExpenses || 0)} expenses
          </div>
        </div>
        
        {/* Control Panel */}
        <div className="control-panel">
          <div className="time-frame-selector">
            <button 
              className={`time-frame-btn ${timeFrame === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFrame('month')}
            >
              📅 Month
            </button>
            <button 
              className={`time-frame-btn ${timeFrame === 'year' ? 'active' : ''}`}
              onClick={() => setTimeFrame('year')}
            >
              📅 Year
            </button>
          </div>

          <div className="date-selectors">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="date-select"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {timeFrame === 'month' && (
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="date-select"
              >
                {availableMonths.map(month => (
                  <option key={month.index} value={month.index}>{month.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* View Navigation */}
        <div className="view-navigation">
          <button 
            className={`view-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            🏠 Overview
          </button>
          <button 
            className={`view-btn ${activeView === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveView('categories')}
          >
            📊 Categories
          </button>
          <button 
            className={`view-btn ${activeView === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveView('trends')}
          >
            📈 Trends
          </button>
          <button 
            className={`view-btn ${activeView === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveView('comparison')}
          >
            ⚖️ Compare
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="stats-content">
        {currentStats || (timeFrame === 'month' && selectedMonthStats) ? (
          <>
            {activeView === 'overview' && renderOverviewView()}
            {activeView === 'categories' && renderCategoriesView()}
            {activeView === 'trends' && renderTrendsView()}
            {activeView === 'comparison' && renderComparisonView()}
          </>
        ) : (
          <div className="empty-state-main">
            <div className="empty-content">
              <div className="empty-icon">📊</div>
              <h3>No Data Available</h3>
              <p>
                No financial data found for {timeFrame === 'month' 
                  ? `${getMonthName(selectedMonth)} ${selectedYear}` 
                  : `${selectedYear}`
                }
              </p>
              <p>Add some transactions to see your analytics here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
