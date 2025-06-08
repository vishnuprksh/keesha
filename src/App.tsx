import React, { useState, useEffect } from 'react';
import './App.css';
import { Expense } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Keesha</h1>
        <p>Your Personal Expense Tracker</p>
      </header>

      <main className="app-main">
        <div className="container">
          <ExpenseSummary expenses={expenses} />
          <div className="content-grid">
            <ExpenseForm onAddExpense={addExpense} />
            <ExpenseList 
              expenses={expenses} 
              onDeleteExpense={deleteExpense}
              onUpdateExpense={updateExpense}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
