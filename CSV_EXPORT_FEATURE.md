# CSV Export Feature

## Overview
A new CSV export functionality has been added to the Transactions page, allowing users to export their filtered transactions to a CSV file for external analysis or backup purposes.

## Features

### Export Button
- Located in the transactions page header next to the "Refresh" and "Show/Hide Filters" buttons
- Styled with a green export icon (📤) and "Export CSV" text
- Automatically disabled when there are no transactions to export
- Respects current filters - only exports the currently filtered/visible transactions

### CSV Format
The exported CSV file uses the exact same format as the CSV import feature to ensure compatibility:

```csv
title,amount,fromAccount,toAccount,date,description
"Salary Payment",3500.00,"Income","Main Bank Account","2025-06-01","Monthly salary"
"Grocery Shopping",45.67,"Main Bank Account","Food & Dining","2025-06-01","Weekly groceries"
```

### File Naming
- Automatically generates descriptive filenames in the format: `transactions_{count}_items_{date}.csv`
- Example: `transactions_25_items_2025-06-21.csv`

## Usage

1. Navigate to the Transactions page
2. Apply any desired filters to narrow down the transactions you want to export
3. Click the "📤 Export CSV" button in the header
4. The CSV file will automatically download to your browser's default download location

## Technical Implementation

### Files Added/Modified
- **New file**: `src/utils/csvExport.ts` - Contains the core CSV export logic
- **Modified**: `src/components/TransactionsPage.tsx` - Added export button and functionality
- **Modified**: `src/App.css` - Added styling for the export button

### Key Functions
- `exportTransactionsToCSV()` - Main export function that converts transactions to CSV and triggers download
- `generateCSVFilename()` - Creates descriptive filenames for exported files

### Compatibility
- The exported CSV format is fully compatible with the existing CSV import feature
- Account names are used instead of internal IDs for better readability
- Handles missing account names gracefully with "Unknown Account" fallback

## Benefits

1. **Data Portability**: Users can export their transaction data for use in external tools like Excel, Google Sheets, or accounting software
2. **Backup**: Provides an easy way to create backups of transaction data
3. **Analysis**: Enables advanced analysis in external tools
4. **Integration**: Compatible with the existing CSV import feature for round-trip data operations
5. **Filtering**: Only exports currently filtered transactions, allowing for targeted exports

## User Experience

- The export button is prominently placed and clearly labeled
- Visual feedback through button states (enabled/disabled)
- Immediate file download without additional steps
- No interruption to the user's workflow
- Consistent with the overall application design and styling
