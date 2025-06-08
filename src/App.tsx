import React, { useState, useEffect } from 'react';
import './App.css';
import { Expense } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import CSVImport from './components/CSVImport';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'import'>('expenses');

  // Load expenses from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('keesha-expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('keesha-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: string, updatedExpense: Omit<Expense, 'id'>) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === id ? { ...updatedExpense, id } : expense
      )
    );
  };

  const importExpenses = (newExpenses: Expense[]) => {
    setExpenses(prev => [...newExpenses, ...prev]);
    setActiveTab('expenses'); // Switch to expenses tab after import
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Keesha</h1>
        <p>Your Personal Expense Tracker</p>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => setActiveTab('expenses')}
            >
              📊 Expenses
            </button>
            <button
              className={`nav-tab ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              📄 CSV Import
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <div className="container">
          {activeTab === 'expenses' && (
            <>
              <ExpenseSummary expenses={expenses} />
              <div className="content-grid">
                <ExpenseForm onAddExpense={addExpense} />
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={deleteExpense}
                  onUpdateExpense={updateExpense}
                />
              </div>
            </>
          )}
          
          {activeTab === 'import' && (
            <CSVImport onImportExpenses={importExpenses} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
