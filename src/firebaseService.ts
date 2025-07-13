import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  onSnapshot,
  Timestamp,
  writeBatch,
  where,
  setDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Transaction, Account, CSVImportSession, UserProfile, UserPreferences } from './types';

// Collections
const TRANSACTIONS_COLLECTION = 'transactions';
const ACCOUNTS_COLLECTION = 'accounts';
const CSV_IMPORTS_COLLECTION = 'csvImports';
const USER_PROFILES_COLLECTION = 'userProfiles';

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
        where('userId', '==', userId)
        // Note: Removed orderBy to avoid requiring composite index while indexes are building
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      // Sort in memory by date descending
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return transactions;
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
      where('userId', '==', userId)
      // Note: Removed orderBy to avoid requiring composite index while indexes are building
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      // Sort in memory by date descending
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log(`Real-time update: received ${transactions.length} transactions for user ${userId}`);
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
        where('userId', '==', userId)
        // Note: Removed orderBy to avoid requiring composite index while indexes are building
      );
      const querySnapshot = await getDocs(q);
      const accounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Account));
      
      // Sort in memory by name
      accounts.sort((a, b) => a.name.localeCompare(b.name));
      
      return accounts;
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
      where('userId', '==', userId)
      // Note: Removed orderBy to avoid requiring composite index while indexes are building
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const accounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Account));
      
      // Sort in memory by name
      accounts.sort((a, b) => a.name.localeCompare(b.name));
      
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

// CSV Import Services
export const csvImportService = {
  // Save a CSV import session
  async saveImportSession(importSession: Omit<CSVImportSession, 'id'>, userId: string): Promise<string> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = await addDoc(collection(database, CSV_IMPORTS_COLLECTION), {
        ...importSession,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving CSV import session:', error);
      throw error;
    }
  },

  // Update a CSV import session
  async updateImportSession(id: string, updates: Partial<CSVImportSession>, userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = doc(database, CSV_IMPORTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating CSV import session:', error);
      throw error;
    }
  },

  // Get all CSV import sessions for a user
  async getImportSessions(userId: string): Promise<CSVImportSession[]> {
    const database = ensureFirebaseConfigured();
    try {
      const q = query(
        collection(database, CSV_IMPORTS_COLLECTION),
        where('userId', '==', userId)
        // Note: Removed orderBy to avoid requiring composite index
        // Sort in memory by date descending
      );
      const querySnapshot = await getDocs(q);
      const importSessions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CSVImportSession[];
      
      // Sort in memory by import date descending
      importSessions.sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime());
      
      return importSessions;
    } catch (error) {
      console.error('Error getting CSV import sessions:', error);
      throw error;
    }
  },

  // Get a specific CSV import session
  async getImportSession(id: string): Promise<CSVImportSession | null> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = doc(database, CSV_IMPORTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CSVImportSession;
    } catch (error) {
      console.error('Error getting CSV import session:', error);
      throw error;
    }
  },

  // Delete a CSV import session
  async deleteImportSession(id: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      await deleteDoc(doc(database, CSV_IMPORTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting CSV import session:', error);
      throw error;
    }
  },

  // Subscribe to CSV import sessions changes for a user
  subscribeToImportSessions(userId: string, callback: (importSessions: CSVImportSession[]) => void): () => void {
    const database = ensureFirebaseConfigured();
    const q = query(
      collection(database, CSV_IMPORTS_COLLECTION),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const importSessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CSVImportSession[];
        
        // Sort in memory by import date descending
        importSessions.sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime());
        
        console.log(`Real-time update: received ${importSessions.length} CSV import sessions for user ${userId}`);
        callback(importSessions);
      },
      (error) => {
        console.error('Error in CSV import sessions subscription:', error);
      }
    );

    return unsubscribe;
  }
};

// User Profile Services
export const userProfileService = {
  // Create or update user profile
  async createUserProfile(userId: string, email: string, displayName: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      console.log(`🔧 UserProfile: Creating profile for user ${userId}`);
      console.log(`📧 UserProfile: Email: ${email}`);
      console.log(`👤 UserProfile: Display name: ${displayName}`);
      
      const defaultPreferences: UserPreferences = {
        currency: 'USD',
        theme: 'auto',
        notifications: {
          email: true,
          push: false
        }
      };

      const userProfile: UserProfile = {
        id: userId,
        email,
        displayName,
        isOnboardingComplete: false,
        preferences: defaultPreferences,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log(`💾 UserProfile: Saving profile to Firestore...`);
      await setDoc(doc(database, USER_PROFILES_COLLECTION, userId), {
        ...userProfile,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ UserProfile: Profile created successfully for user ${userId}`);
    } catch (error) {
      console.error(`🚨 UserProfile: Error creating profile for user ${userId}:`, error);
      if (error instanceof Error) {
        console.error('🚨 UserProfile: Error message:', error.message);
        console.error('🚨 UserProfile: Error stack:', error.stack);
      }
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const database = ensureFirebaseConfigured();
    try {
      console.log(`🔍 UserProfile: Getting profile for user ${userId}`);
      const docRef = doc(database, USER_PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      console.log(`📄 UserProfile: Document exists: ${docSnap.exists()}`);
      
      if (!docSnap.exists()) {
        console.log(`❌ UserProfile: No profile found for user ${userId}`);
        return null;
      }

      const profile = {
        id: docSnap.id,
        ...docSnap.data()
      } as UserProfile;
      
      console.log(`✅ UserProfile: Profile retrieved successfully:`, profile);
      return profile;
    } catch (error) {
      console.error(`🚨 UserProfile: Error getting profile for user ${userId}:`, error);
      if (error instanceof Error) {
        console.error('🚨 UserProfile: Error message:', error.message);
        if ('code' in error) {
          console.error('🚨 UserProfile: Error code:', (error as any).code);
        }
      }
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = doc(database, USER_PROFILES_COLLECTION, userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Mark onboarding as complete
  async completeOnboarding(userId: string): Promise<void> {
    const database = ensureFirebaseConfigured();
    try {
      const docRef = doc(database, USER_PROFILES_COLLECTION, userId);
      await updateDoc(docRef, {
        isOnboardingComplete: true,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  // Subscribe to user profile changes
  subscribeToUserProfile(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    const database = ensureFirebaseConfigured();
    const docRef = doc(database, USER_PROFILES_COLLECTION, userId);
    
    console.log(`🔍 UserProfile: Setting up subscription for user ${userId}`);
    
    return onSnapshot(docRef, (docSnap) => {
      console.log(`📄 UserProfile: Document snapshot received for user ${userId}`);
      console.log(`📄 UserProfile: Document exists: ${docSnap.exists()}`);
      
      if (docSnap.exists()) {
        const profile = {
          id: docSnap.id,
          ...docSnap.data()
        } as UserProfile;
        console.log(`✅ UserProfile: Profile loaded successfully:`, profile);
        callback(profile);
      } else {
        console.log(`❌ UserProfile: No profile found for user ${userId}`);
        callback(null);
      }
    }, (error) => {
      console.error(`🚨 UserProfile: Error listening to user profile for ${userId}:`, error);
      console.error('🚨 UserProfile: Error code:', error.code);
      console.error('🚨 UserProfile: Error message:', error.message);
      
      // Handle specific permission errors
      if (error.code === 'permission-denied') {
        console.error('🚨 UserProfile: Permission denied - check Firebase security rules');
        console.error('🚨 UserProfile: Make sure the updated firestore.rules are deployed');
      }
      
      // Call callback with null to indicate error state
      callback(null);
    });
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
