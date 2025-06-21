import { useState, useEffect, useCallback } from 'react';
import { Transaction, Account } from './types';
import { transactionService, accountService } from './firebaseService';
import { isFirebaseConfigured } from './firebase';

export const useFirebaseData = (userId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseNotConfigured, setFirebaseNotConfigured] = useState(false);

  // Initialize data and set up real-time listeners
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setFirebaseNotConfigured(true);
      setLoading(false);
      return;
    }

    if (!userId) {
      setLoading(false);
      setTransactions([]);
      setAccounts([]);
      return;
    }

    let unsubscribeTransactions: (() => void) | undefined;
    let unsubscribeAccounts: (() => void) | undefined;
    let accountsLoaded = false;
    let transactionsLoaded = false;

    const checkInitialLoadComplete = () => {
      if (accountsLoaded && transactionsLoaded) {
        setLoading(false);
      }
    };

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        accountsLoaded = false;
        transactionsLoaded = false;

        // Set up real-time listeners
        unsubscribeTransactions = transactionService.subscribeToTransactions(userId, (newTransactions) => {
          console.log(`useFirebaseData: Transaction update received - ${newTransactions.length} transactions`);
          setTransactions(newTransactions);
          if (!transactionsLoaded) {
            transactionsLoaded = true;
            checkInitialLoadComplete();
          }
        });

        unsubscribeAccounts = accountService.subscribeToAccounts(userId, (newAccounts) => {
          console.log(`useFirebaseData: Account update received - ${newAccounts.length} accounts`);
          setAccounts(newAccounts);
          if (!accountsLoaded) {
            accountsLoaded = true;
            checkInitialLoadComplete();
          }
        });

      } catch (err) {
        console.error('Error initializing Firebase data:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize data');
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      if (unsubscribeTransactions) unsubscribeTransactions();
      if (unsubscribeAccounts) unsubscribeAccounts();
    };
  }, [userId]);

  // Transaction operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    try {
      await transactionService.addTransaction(transaction, userId);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, [userId]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (!userId) return;
    try {
      await transactionService.updateTransaction(id, updates, userId);
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, [userId]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, []);

  const importTransactions = useCallback(async (transactionsToImport: Omit<Transaction, 'id'>[]) => {
    if (!userId) return;
    try {
      await transactionService.batchImportTransactions(transactionsToImport, userId);
    } catch (err) {
      console.error('Error importing transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to import transactions');
      throw err;
    }
  }, [userId]);

  // Account operations
  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    if (!userId) return;
    try {
      await accountService.addAccount(account, userId);
    } catch (err) {
      console.error('Error adding account:', err);
      setError(err instanceof Error ? err.message : 'Failed to add account');
      throw err;
    }
  }, [userId]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    if (!userId) return;
    try {
      await accountService.updateAccount(id, updates, userId);
    } catch (err) {
      console.error('Error updating account:', err);
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    }
  }, [userId]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await accountService.deleteAccount(id);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    }
  }, []);

  const importAccounts = useCallback(async (accountsToImport: Omit<Account, 'id'>[]) => {
    if (!userId) return;
    try {
      await accountService.batchImportAccounts(accountsToImport, userId);
    } catch (err) {
      console.error('Error importing accounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to import accounts');
      throw err;
    }
  }, [userId]);

  return {
    transactions,
    accounts,
    loading,
    error,
    firebaseNotConfigured,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    addAccount,
    updateAccount,
    deleteAccount,
    importAccounts,
    clearError: () => setError(null)
  };
};
