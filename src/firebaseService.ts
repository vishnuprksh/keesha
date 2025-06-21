import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Transaction, Account } from './types';

// Collections
const TRANSACTIONS_COLLECTION = 'transactions';
const ACCOUNTS_COLLECTION = 'accounts';

// Helper function to check Firebase configuration
const ensureFirebaseConfigured = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Please set up Firebase configuration.');
  }
  return db;
};

// Transaction Services
export const transactionService = {
  // Add a new transaction
  async addTransaction(transaction: Omit<Transaction, 'id'>, userId: string): Promise<string> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = await addDoc(collection(database, TRANSACTIONS_COLLECTION), {
        ...transaction,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Update a transaction
  async updateTransaction(id: string, updates: Partial<Transaction>, userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const transactionRef = doc(database, TRANSACTIONS_COLLECTION, id);
      await updateDoc(transactionRef, {
        ...updates,
        userId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  async deleteTransaction(id: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const transactionRef = doc(database, TRANSACTIONS_COLLECTION, id);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Get all transactions for a user
  async getAllTransactions(userId: string): Promise<Transaction[]> {
    const database = ensureFirebaseConfigured();
    try {
      const q = query(
        collection(database, TRANSACTIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Listen to transactions changes in real-time for a user
  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void): () => void {
    const database = ensureFirebaseConfigured();
    const q = query(
      collection(database, TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      callback(transactions);
    }, (error) => {
      console.error('Error listening to transactions:', error);
    });
  },

  // Batch import transactions for a user
  async batchImportTransactions(transactions: Omit<Transaction, 'id'>[], userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const batch = writeBatch(database);
      const transactionsRef = collection(database, TRANSACTIONS_COLLECTION);

      transactions.forEach((transaction) => {
        const docRef = doc(transactionsRef);
        batch.set(docRef, {
          ...transaction,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch importing transactions:', error);
      throw error;
    }
  }
};

// Account Services
export const accountService = {
  // Add a new account
  async addAccount(account: Omit<Account, 'id'>, userId: string): Promise<string> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = await addDoc(collection(database, ACCOUNTS_COLLECTION), {
        ...account,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  },

  // Update an account
  async updateAccount(id: string, updates: Partial<Account>, userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const accountRef = doc(database, ACCOUNTS_COLLECTION, id);
      await updateDoc(accountRef, {
        ...updates,
        userId,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  // Delete an account
  async deleteAccount(id: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const accountRef = doc(database, ACCOUNTS_COLLECTION, id);
      await deleteDoc(accountRef);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Get all accounts for a user
  async getAllAccounts(userId: string): Promise<Account[]> {
    const database = ensureFirebaseConfigured();
    try {
      const q = query(
        collection(database, ACCOUNTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Account));
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  },

  // Listen to accounts changes in real-time for a user
  subscribeToAccounts(userId: string, callback: (accounts: Account[]) => void): () => void {
    const database = ensureFirebaseConfigured();
    const q = query(
      collection(database, ACCOUNTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('name')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const accounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Account));
      callback(accounts);
    }, (error) => {
      console.error('Error listening to accounts:', error);
    });
  },

  // Batch import accounts for a user
  async batchImportAccounts(accounts: Omit<Account, 'id'>[], userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const batch = writeBatch(database);
      const accountsRef = collection(database, ACCOUNTS_COLLECTION);

      accounts.forEach((account) => {
        const docRef = doc(accountsRef);
        batch.set(docRef, {
          ...account,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error batch importing accounts:', error);
      throw error;
    }
  }
};

// Migration helper
export const migrationService = {
  // Migrate local storage data to Firebase for a specific user
  async migrateLocalStorageToFirebase(userId: string): Promise<void> {
    try {
      const savedAccounts = localStorage.getItem('keesha-accounts');
      const savedTransactions = localStorage.getItem('keesha-transactions');

      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts) as Account[];
        const accountsWithoutId = accounts.map(({ id, ...account }) => account);
        await accountService.batchImportAccounts(accountsWithoutId, userId);
        console.log('Migrated accounts to Firebase');
      }

      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions) as Transaction[];
        const transactionsWithoutId = transactions.map(({ id, ...transaction }) => transaction);
        await transactionService.batchImportTransactions(transactionsWithoutId, userId);
        console.log('Migrated transactions to Firebase');
      }

    } catch (error) {
      console.error('Error migrating data to Firebase:', error);
      throw error;
    }
  }
};
