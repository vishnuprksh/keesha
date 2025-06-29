import React, { useState } from 'react';
import './App.css';
import { Transaction, Account } from './types';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import TransactionSummary from './components/TransactionSummary';
import TransactionsPage from './components/TransactionsPage';
import AccountManager from './components/AccountManager';
import CSVImport from './components/CSVImport';
import StatsPage from './components/StatsPage';
import FirebaseSetup from './components/FirebaseSetup';
import LoginPage from './components/LoginPage';
import UserHeader from './components/UserHeader';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { useFirebaseData } from './useFirebaseData';
import { useAuth } from './useAuth';
import { isAccountUsedInTransactions } from './utils/validation';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'transactions' | 'accounts' | 'stats' | 'import'>('home');
  
  // Authentication
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut, clearError: clearAuthError } = useAuth();
  
  // Use Firebase data with user ID
  const {
    transactions,
    accounts,
    loading: dataLoading,
    error: dataError,
    firebaseNotConfigured,
    addTransaction: firebaseAddTransaction,
    updateTransaction: firebaseUpdateTransaction,
    deleteTransaction: firebaseDeleteTransaction,
    importTransactions: firebaseImportTransactions,
    addAccount: firebaseAddAccount,
    updateAccount: firebaseUpdateAccount,
    deleteAccount: firebaseDeleteAccount,
    clearError: clearDataError
  } = useFirebaseData(user?.uid);

  // Transaction operations with account balance updates
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Get fresh account data to avoid stale balance issues
      const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
      
      if (!fromAccount || !toAccount) {
        throw new Error('From or To account not found');
      }
      
      // Add transaction first
      await firebaseAddTransaction(transaction);
      
      // Update account balances with optimistic updates
      if (fromAccount) {
        await firebaseUpdateAccount(fromAccount.id, {
          ...fromAccount,
          balance: fromAccount.balance - transaction.amount
        });
      }
      
      if (toAccount) {
        await firebaseUpdateAccount(toAccount.id, {
          ...toAccount,
          balance: toAccount.balance + transaction.amount
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        // Get fresh account data to avoid stale balance issues
        const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
        const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
        
        // Delete transaction first
        await firebaseDeleteTransaction(id);
        
        // Reverse the account balance changes
        if (fromAccount) {
          await firebaseUpdateAccount(fromAccount.id, {
            ...fromAccount,
            balance: fromAccount.balance + transaction.amount
          });
        }
        
        if (toAccount) {
          await firebaseUpdateAccount(toAccount.id, {
            ...toAccount,
            balance: toAccount.balance - transaction.amount
          });
        }
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    try {
      const oldTransaction = transactions.find(t => t.id === id);
      if (oldTransaction) {
        // Get fresh account data to avoid stale balance issues
        const oldFromAccount = accounts.find(acc => acc.id === oldTransaction.fromAccountId);
        const oldToAccount = accounts.find(acc => acc.id === oldTransaction.toAccountId);
        const newFromAccount = accounts.find(acc => acc.id === updatedTransaction.fromAccountId);
        const newToAccount = accounts.find(acc => acc.id === updatedTransaction.toAccountId);
        
        if (!oldFromAccount || !oldToAccount || !newFromAccount || !newToAccount) {
          throw new Error('One or more accounts not found');
        }
        
        // Update transaction first
        await firebaseUpdateTransaction(id, updatedTransaction);
        
        // Reverse old transaction effects
        if (oldFromAccount) {
          await firebaseUpdateAccount(oldFromAccount.id, {
            ...oldFromAccount,
            balance: oldFromAccount.balance + oldTransaction.amount
          });
        }
        
        if (oldToAccount) {
          await firebaseUpdateAccount(oldToAccount.id, {
            ...oldToAccount,
            balance: oldToAccount.balance - oldTransaction.amount
          });
        }
        
        // Apply new transaction effects (get fresh account data if accounts changed)
        const finalFromAccount = newFromAccount.id === oldFromAccount.id 
          ? { ...oldFromAccount, balance: oldFromAccount.balance + oldTransaction.amount }
          : newFromAccount;
        const finalToAccount = newToAccount.id === oldToAccount.id 
          ? { ...oldToAccount, balance: oldToAccount.balance - oldTransaction.amount }
          : newToAccount;
        
        if (finalFromAccount) {
          await firebaseUpdateAccount(finalFromAccount.id, {
            ...finalFromAccount,
            balance: finalFromAccount.balance - updatedTransaction.amount
          });
        }
        
        if (finalToAccount) {
          await firebaseUpdateAccount(finalToAccount.id, {
            ...finalToAccount,
            balance: finalToAccount.balance + updatedTransaction.amount
          });
        }
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const toggleImportant = async (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        await firebaseUpdateTransaction(id, {
          ...transaction,
          isImportant: !transaction.isImportant
        });
      }
    } catch (error) {
      console.error('Error toggling transaction importance:', error);
      throw error;
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    try {
      await firebaseAddAccount(account);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const updateAccount = async (id: string, updatedAccount: Omit<Account, 'id'>) => {
    try {
      await firebaseUpdateAccount(id, updatedAccount);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      // Check if account is used in any transactions
      if (isAccountUsedInTransactions(id, transactions)) {
        alert('Cannot delete account that has transactions. Please delete related transactions first.');
        return;
      }
      await firebaseDeleteAccount(id);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const importTransactions = async (newTransactions: Transaction[]) => {
    try {
      console.log(`App: Starting import of ${newTransactions.length} transactions`);
      
      // Import transactions to Firebase first - this will trigger the real-time listeners
      const transactionsWithoutId = newTransactions.map(({ id, ...transaction }) => transaction);
      console.log('App: Importing transactions to Firebase...');
      await firebaseImportTransactions(transactionsWithoutId);
      console.log('App: Transactions imported to Firebase successfully');
      
      // Wait a short moment for Firebase to process the batch and trigger listeners
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update account balances in batches for better performance
      const accountUpdates: { [accountId: string]: number } = {};
      
      // Calculate balance changes for each account
      for (const transaction of newTransactions) {
        // Subtract from source account
        accountUpdates[transaction.fromAccountId] = (accountUpdates[transaction.fromAccountId] || 0) - transaction.amount;
        
        // Add to destination account
        accountUpdates[transaction.toAccountId] = (accountUpdates[transaction.toAccountId] || 0) + transaction.amount;
      }
      
      console.log('App: Updating account balances...', accountUpdates);
      
      // Apply all balance updates
      for (const accountId in accountUpdates) {
        const balanceChange = accountUpdates[accountId];
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
          await firebaseUpdateAccount(account.id, {
            ...account,
            balance: account.balance + balanceChange
          });
        }
      }
      
      console.log('App: Account balances updated successfully');
      
      // Force a brief wait to ensure all updates are processed
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('App: Import process completed, switching to home tab');
      setActiveTab('home');
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  // Show Firebase setup if not configured
  if (firebaseNotConfigured) {
    return (
      <div className="app">
        <header className="app-header">
          <div style={{ textAlign: 'center' }}>
            <h1>💰 Keesha</h1>
            <p>Your Personal Expense Tracker</p>
          </div>
        </header>
        <main className="app-main">
          <FirebaseSetup onSetupComplete={() => window.location.reload()} />
        </main>
      </div>
    );
  }

  // Show login if user is not authenticated
  if (!user && !authLoading) {
    return (
      <LoginPage 
        onSignIn={signInWithGoogle}
        loading={authLoading}
        error={authError}
        onClearError={clearAuthError}
      />
    );
  }

  // Show loading state
  const loading = authLoading || dataLoading;
  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <div style={{ textAlign: 'center' }}>
            <h1>💰 Keesha</h1>
            <p>Your Personal Expense Tracker</p>
          </div>
        </header>
        <main className="app-main">
          <div className="container">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner 
                size="lg" 
                text={authLoading ? 'Signing you in...' : 'Loading your data...'}
              />
              <p style={{ marginTop: '1rem' }}>
                Please wait while we set up your account.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  const error = authError || dataError;
  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <div style={{ textAlign: 'center' }}>
            <h1>💰 Keesha</h1>
            <p>Your Personal Expense Tracker</p>
          </div>
        </header>
        <main className="app-main">
          <div className="container">
            <ErrorMessage
              message={error}
              onRetry={() => {
                clearAuthError();
                clearDataError();
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>💰 Keesha</h1>
            <p>Your Personal Expense Tracker</p>
          </div>
          {user && (
            <div style={{ position: 'absolute', right: 0 }}>
              <UserHeader user={user} onSignOut={signOut} />
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              🏠 Home
            </button>
            <button
              className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              💰 Transactions
            </button>
            <button
              className={`nav-tab ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              🏦 Accounts
            </button>
            <button
              className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Stats
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

      <main className={`app-main ${activeTab === 'import' ? 'csv-import-mode' : ''}`}>
        {activeTab === 'import' ? (
          // CSV Import gets full width without container constraints
          <CSVImport accounts={accounts} onImportTransactions={importTransactions} userId={user?.uid || null} />
        ) : (
          <div className="container">
            {activeTab === 'home' && (
              <>
                <TransactionSummary transactions={transactions} accounts={accounts} />
                <div className="content-grid">
                  <TransactionForm accounts={accounts} onAddTransaction={addTransaction} />
                  <TransactionList 
                    transactions={transactions}
                    accounts={accounts}
                    onDeleteTransaction={deleteTransaction}
                    onUpdateTransaction={updateTransaction}
                  />
                </div>
              </>
            )}
            
            {activeTab === 'transactions' && (
              <TransactionsPage
                transactions={transactions}
                accounts={accounts}
                onDeleteTransaction={deleteTransaction}
                onUpdateTransaction={updateTransaction}
                onToggleImportant={toggleImportant}
              />
            )}
            
            {activeTab === 'accounts' && (
              <AccountManager
                accounts={accounts}
                onAddAccount={addAccount}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
              />
            )}
            
            {activeTab === 'stats' && (
              <StatsPage
                transactions={transactions}
                accounts={accounts}
              />
            )}
          </div>
        )}
      </main>

      {/* Sync Status Indicator */}
      <SyncStatusIndicator 
        loading={dataLoading} 
        error={dataError} 
        onRetry={() => {
          clearDataError();
          window.location.reload();
        }}
      />
    </div>
  );
}

export default App;
