# Data Synchronization Architecture for Keesha

## Overview

Keesha uses Firebase Firestore for real-time data synchronization across all devices and browser tabs. This document explains how the synchronization works and ensures data consistency across all pages.

## Architecture Components

### 1. Real-time Database Listeners

**File**: `src/useFirebaseData.ts`

- Uses Firebase's `onSnapshot()` to listen for real-time changes
- Automatically updates React state when data changes in the database
- Provides real-time sync across all connected clients

```typescript
// Real-time listeners are set up for both transactions and accounts
unsubscribeTransactions = transactionService.subscribeToTransactions(userId, (newTransactions) => {
  setTransactions(newTransactions);
});

unsubscribeAccounts = accountService.subscribeToAccounts(userId, (newAccounts) => {
  setAccounts(newAccounts);
});
```

### 2. Centralized State Management

**File**: `src/App.tsx`

- All data flows through the main App component
- Data is passed down to individual pages as props
- Ensures all pages have access to the same synchronized data

```typescript
// All pages receive the same synchronized data
{activeTab === 'home' && (
  <>
    <TransactionSummary transactions={transactions} accounts={accounts} />
    <TransactionForm accounts={accounts} onAddTransaction={addTransaction} />
    <TransactionList transactions={transactions} accounts={accounts} />
  </>
)}

{activeTab === 'transactions' && (
  <TransactionsPage transactions={transactions} accounts={accounts} />
)}

{activeTab === 'stats' && (
  <StatsPage transactions={transactions} accounts={accounts} />
)}
```

### 3. User-Scoped Data

**File**: `src/firebaseService.ts`

- All data is filtered by `userId` to ensure privacy
- Each user only sees their own transactions and accounts
- Firebase security rules enforce user-level access control

```typescript
// All queries include userId filter
const q = query(
  collection(database, TRANSACTIONS_COLLECTION),
  where('userId', '==', userId),
  orderBy('date', 'desc')
);
```

### 4. Optimistic Updates with Error Handling

**File**: `src/App.tsx`

- Operations are performed immediately for better UX
- Proper error handling reverts changes if operations fail
- Account balances are updated atomically with transactions

### 5. Offline Support

Firebase provides built-in offline support:
- Data is cached locally when offline
- Changes are queued and synced when connection is restored
- Users can continue working without internet connectivity

## Data Flow

### Adding a Transaction

1. User fills out transaction form
2. `addTransaction()` function is called
3. Transaction is added to Firebase
4. Account balances are updated in Firebase
5. Real-time listeners detect changes
6. All components automatically re-render with new data
7. Changes are immediately visible on all connected devices

### Editing/Deleting Transactions

1. User modifies or deletes a transaction
2. Firebase operations are performed
3. Account balances are adjusted accordingly
4. Real-time listeners propagate changes
5. All pages instantly reflect the updates

### Page Navigation

- No additional data loading required when switching pages
- All pages use the same synchronized data from the central state
- Changes made on one page are immediately visible on all other pages

## Synchronization Features

### ✅ Real-time Updates
- Changes appear instantly across all devices
- No manual refresh required
- Uses WebSocket connections for minimal latency

### ✅ Conflict Resolution
- Firebase handles concurrent updates automatically
- Last-write-wins strategy for most operations
- Proper error handling for failed operations

### ✅ Data Consistency
- All pages show the same data at all times
- Account balances are always up-to-date
- Transaction history is consistent across all views

### ✅ Error Handling
- Network errors are gracefully handled
- Users are notified of sync issues
- Retry mechanisms for failed operations

### ✅ Performance Optimization
- Data is paginated for large datasets
- Efficient queries with proper indexing
- Minimal data transfer using real-time listeners

## Sync Status Indicator

The application includes a visual sync status indicator that shows:
- 🔄 **Syncing**: When data is being synchronized
- ✅ **Synced**: When all data is up-to-date
- ⚠️ **Error**: When there are sync issues with retry option

## Security

- All data access is authenticated and authorized
- Firebase security rules prevent unauthorized access
- User data is completely isolated per user account

## Testing Data Sync

To verify that data synchronization is working:

1. **Multi-tab Test**: Open the app in multiple browser tabs
   - Add a transaction in one tab
   - Verify it appears instantly in other tabs

2. **Multi-device Test**: Open the app on different devices
   - Make changes on one device
   - Confirm changes appear on other devices

3. **Offline Test**: Disconnect from internet
   - Make changes while offline
   - Reconnect and verify changes are synced

4. **Page Navigation Test**: Switch between different pages
   - Add data on the home page
   - Navigate to transactions page and verify data is there
   - Check stats page for updated calculations

## Troubleshooting

### Data Not Syncing
1. Check Firebase configuration
2. Verify internet connection
3. Check browser console for errors
4. Try refreshing the page

### Slow Sync
1. Check network speed
2. Verify Firebase service status
3. Check for large data operations

### Sync Errors
1. Check Firebase security rules
2. Verify user authentication
3. Check browser console for detailed error messages

## Conclusion

Keesha's data synchronization architecture ensures that all pages always display the most current data. The combination of real-time Firebase listeners, centralized state management, and proper error handling provides a seamless multi-device experience with instant updates across all connected clients.
