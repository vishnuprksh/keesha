import React, { useState } from 'react';
import './App.css';
import './styles/onboarding.css';
import { Transaction, Account } from './types';
import TransactionsPage from './components/TransactionsPage';
import AccountManager from './components/AccountManager';
import HomePage from './components/HomePage';
import StatsPage from './components/StatsPage';
import FirebaseSetup from './components/FirebaseSetup';
import LoginPage from './components/LoginPage';
import UserHeader from './components/UserHeader';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import OnboardingWizard from './components/OnboardingWizard';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { useFirebaseData } from './useFirebaseData';
import { useAuth } from './useAuth';
import { useUserProfile } from './hooks/useUserProfile';
import { isAccountUsedInTransactions } from './utils/validation';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'transactions' | 'accounts'>('home');
  
  // Authentication
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOut, clearError: clearAuthError } = useAuth();
  
  // User Profile Management
  const { 
    userProfile, 
    loading: profileLoading, 
    error: profileError,
    createUserProfile,
    completeOnboarding,
    clearError: clearProfileError
  } = useUserProfile(user?.uid);
  
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
      
      console.log('App: Import process completed, staying on home tab');
      // Keep user on home tab instead of switching to dashboard
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (selectedAccounts: Omit<Account, 'id'>[]) => {
    try {
      console.log('🚀 App: Starting onboarding completion');
      if (!user) {
        console.log('🚨 App: No user found during onboarding completion');
        return;
      }
      
      console.log(`👤 App: User info - ID: ${user.uid}, Email: ${user.email}, Name: ${user.displayName}`);
      
      // Create user profile if it doesn't exist
      if (!userProfile) {
        console.log('🔧 App: Creating user profile (profile does not exist)');
        await createUserProfile(
          user.email || '',
          user.displayName || 'User'
        );
        console.log('✅ App: User profile creation initiated');
      } else {
        console.log('ℹ️ App: User profile already exists, skipping creation');
      }
      
      // Import selected accounts
      if (selectedAccounts.length > 0) {
        console.log(`📊 App: Importing ${selectedAccounts.length} selected accounts`);
        await firebaseImportAccounts(selectedAccounts);
        console.log('✅ App: Accounts imported successfully');
      } else {
        console.log('ℹ️ App: No accounts selected for import');
      }
      
      // Mark onboarding as complete
      console.log('🏁 App: Marking onboarding as complete');
      await completeOnboarding();
      console.log('✅ App: Onboarding completion process finished');
      
    } catch (error) {
      console.error('🚨 App: Error completing onboarding:', error);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      console.log('⏭️ App: Starting onboarding skip');
      if (!user) {
        console.log('🚨 App: No user found during onboarding skip');
        return;
      }
      
      console.log(`👤 App: User info - ID: ${user.uid}, Email: ${user.email}, Name: ${user.displayName}`);
      
      // Create user profile if it doesn't exist
      if (!userProfile) {
        console.log('🔧 App: Creating user profile (onboarding skipped)');
        await createUserProfile(
          user.email || '',
          user.displayName || 'User'
        );
        console.log('✅ App: User profile creation initiated');
      } else {
        console.log('ℹ️ App: User profile already exists, skipping creation');
      }
      
      // Mark onboarding as complete
      console.log('🏁 App: Marking onboarding as complete (skipped)');
      await completeOnboarding();
      console.log('✅ App: Onboarding skip process finished');
      
    } catch (error) {
      console.error('🚨 App: Error skipping onboarding:', error);
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
  const loading = authLoading || dataLoading || profileLoading;
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
                text={authLoading ? 'Signing you in...' : profileLoading ? 'Setting up your profile...' : 'Loading your data...'}
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

  // Show onboarding if user profile doesn't exist or onboarding is not complete
  // Also handle cases where we can't access user profile due to permissions
  const shouldShowOnboarding = user && (
    !userProfile || 
    !userProfile.isOnboardingComplete ||
    (profileError && profileError.includes('permission'))
  );
  
  // TEMPORARY: If there's a permission error, we can still allow access to main app
  // This allows existing users to continue working while Firebase rules are deployed
  const hasPermissionError = profileError && profileError.includes('permission');
  
  // Show permission error notification if needed
  const showPermissionNotification = hasPermissionError && user;

  if (shouldShowOnboarding && !profileLoading && !hasPermissionError) {
    console.log('🎯 App: Showing onboarding wizard');
    console.log('🎯 App: Reasons:', {
      noUserProfile: !userProfile,
      onboardingIncomplete: userProfile && !userProfile.isOnboardingComplete,
      permissionError: profileError && profileError.includes('permission')
    });
    
    return (
      <>
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </>
    );
  }
  
  // TEMPORARY: If there's a permission error but user has existing data, show main app
  if (hasPermissionError && accounts.length > 0) {
    console.log('⚠️ App: Permission error detected but user has existing data - showing main app');
    console.log('⚠️ App: Deploy Firebase rules to enable user profiles and onboarding');
  }

  // Show error state
  const error = authError || dataError || profileError;
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
                clearProfileError();
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Permission notification banner */}
      {showPermissionNotification && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ⚠️ User profiles disabled due to Firebase rules. Deploy updated rules to enable onboarding and enhanced features.
          <span style={{ marginLeft: '10px' }}>
            <a 
              href="https://console.firebase.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#856404', textDecoration: 'underline' }}
            >
              Firebase Console
            </a>
          </span>
        </div>
      )}
      
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
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              � Dashboard
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
          </div>
        </div>
      </nav>

      <main className={`app-main ${activeTab === 'home' ? 'home-mode' : ''}`}>
        {activeTab === 'home' ? (
          // Home page gets full width without container constraints
          <HomePage accounts={accounts} onImportTransactions={importTransactions} userId={user?.uid || null} />
        ) : (
          <div className="container">
            {activeTab === 'dashboard' && (
              <StatsPage
                transactions={transactions}
                accounts={accounts}
              />
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
