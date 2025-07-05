import React, { useState, useEffect } from 'react';
import './App.css';
import { Transaction, Account, DEFAULT_ACCOUNTS } from './types';
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
import { useFirebaseData } from './useFirebaseData';
import { useAuth } from './useAuth';
import { migrationService } from './firebaseService';

function App() {
  const [activeTab, setActiveTab] = useState<'import' | 'dashboard' | 'transactions' | 'accounts' | 'stats'>('import');
  const [isMigrating, setIsMigrating] = useState(false);
  
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
    importAccounts: firebaseImportAccounts,
    clearError: clearDataError
  } = useFirebaseData(user?.uid);

  // Initialize default accounts if none exist for the user
  useEffect(() => {
    const initializeDefaultAccounts = async () => {
      if (!user || dataLoading || accounts.length > 0) return;
      
      // Check if we need to migrate from localStorage
      const savedAccounts = localStorage.getItem('keesha-accounts');
      const savedTransactions = localStorage.getItem('keesha-transactions');
      
      if (savedAccounts || savedTransactions) {
        // Migrate existing data to this user's account
        setIsMigrating(true);
        try {
          await migrationService.migrateLocalStorageToFirebase(user.uid);
          // Clear localStorage after successful migration
          localStorage.removeItem('keesha-accounts');
          localStorage.removeItem('keesha-transactions');
          localStorage.removeItem('keesha-expenses'); // Remove old expense data too
          console.log('Migration completed successfully');
        } catch (error) {
          console.error('Migration failed:', error);
          // Fallback to creating default accounts
          await firebaseImportAccounts(DEFAULT_ACCOUNTS);
        } finally {
          setIsMigrating(false);
        }
      } else {
        // Create default accounts for new user
        await firebaseImportAccounts(DEFAULT_ACCOUNTS);
      }
    };

    initializeDefaultAccounts();
  }, [user, dataLoading, accounts.length, firebaseImportAccounts]);

  // Transaction operations with account balance updates
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      await firebaseAddTransaction(transaction);
      
      // Update account balances
      const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
      const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
      
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
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        // Reverse the account balance changes
        const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
        const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
        
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
        
        await firebaseDeleteTransaction(id);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    try {
      const oldTransaction = transactions.find(t => t.id === id);
      if (oldTransaction) {
        // Reverse old transaction effects
        const oldFromAccount = accounts.find(acc => acc.id === oldTransaction.fromAccountId);
        const oldToAccount = accounts.find(acc => acc.id === oldTransaction.toAccountId);
        
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
        
        // Apply new transaction effects
        const newFromAccount = accounts.find(acc => acc.id === updatedTransaction.fromAccountId);
        const newToAccount = accounts.find(acc => acc.id === updatedTransaction.toAccountId);
        
        if (newFromAccount) {
          await firebaseUpdateAccount(newFromAccount.id, {
            ...newFromAccount,
            balance: newFromAccount.balance - updatedTransaction.amount
          });
        }
        
        if (newToAccount) {
          await firebaseUpdateAccount(newToAccount.id, {
            ...newToAccount,
            balance: newToAccount.balance + updatedTransaction.amount
          });
        }
        
        await firebaseUpdateTransaction(id, updatedTransaction);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
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
      const isUsed = transactions.some(t => t.fromAccountId === id || t.toAccountId === id);
      if (isUsed) {
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
      // Import transactions to Firebase
      const transactionsWithoutId = newTransactions.map(({ id, ...transaction }) => transaction);
      await firebaseImportTransactions(transactionsWithoutId);
      
      // Update account balances
      for (const transaction of newTransactions) {
        const fromAccount = accounts.find(acc => acc.id === transaction.fromAccountId);
        const toAccount = accounts.find(acc => acc.id === transaction.toAccountId);
        
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
      }
      
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error importing transactions:', error);
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
  const loading = authLoading || dataLoading || isMigrating;
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
              <h2>
                {isMigrating ? 'Migrating your data...' : 
                 authLoading ? 'Signing you in...' : 
                 'Loading your data...'}
              </h2>
              <p>
                {isMigrating ? 'We\'re moving your existing data to the cloud.' : 
                 'Please wait while we set up your account.'}
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
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h2>Error</h2>
              <p>{error}</p>
              <button 
                onClick={() => {
                  clearAuthError();
                  clearDataError();
                }} 
                style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}
              >
                Retry
              </button>
            </div>
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
              className={`nav-tab ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              📄 CSV Import
            </button>
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
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

      <main className="app-main">
        <div className="container">
          {activeTab === 'dashboard' && (
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
          
          {activeTab === 'import' && (
            <CSVImport accounts={accounts} onImportTransactions={importTransactions} userId={user?.uid || null} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
