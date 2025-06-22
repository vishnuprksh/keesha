// Test script to verify the CSV validation fix
const { validateCSVTransaction } = require('./src/utils/validation.ts');

// Mock accounts
const accounts = [
  { id: 'bank-1', name: 'Main Bank Account', type: 'bank' },
  { id: 'income-1', name: 'Income', type: 'income' },
  { id: 'expense-1', name: 'Food & Dining', type: 'expense' }
];

// Test 1: Original CSV data (should work)
const originalCSVRow = {
  title: 'Test Transaction',
  amount: '100.00',
  fromAccount: 'Income',
  toAccount: 'Main Bank Account',
  date: '2025-06-22'
};

// Test 2: Updated data after user selects from dropdown (should work after fix)
const updatedRow = {
  title: 'Test Transaction',
  amount: '100.00',
  fromAccountId: 'income-1',
  toAccountId: 'bank-1',
  date: '2025-06-22'
};

console.log('Test 1 - Original CSV data:');
console.log(validateCSVTransaction(originalCSVRow, accounts));

console.log('\nTest 2 - Updated data with account IDs:');
console.log(validateCSVTransaction(updatedRow, accounts));

console.log('\nTest 3 - Mixed data (original fromAccount, updated toAccountId):');
const mixedRow = {
  title: 'Test Transaction',
  amount: '100.00',
  fromAccount: 'Income',
  toAccountId: 'bank-1',
  date: '2025-06-22'
};
console.log(validateCSVTransaction(mixedRow, accounts));
