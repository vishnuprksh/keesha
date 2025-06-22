#!/bin/bash

# CSV Import Test Script
# This script helps verify that the CSV import functionality is working correctly

echo "🧪 CSV Import Functionality Test"
echo "================================="
echo ""

# Check if the app is running
echo "📱 Checking if app is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ App is running at http://localhost:3000"
else
    echo "❌ App is not running. Please start with: npm start"
    exit 1
fi

# Check if sample CSV exists
echo ""
echo "📄 Checking test data..."
if [ -f "sample-transactions.csv" ]; then
    echo "✅ Sample CSV file found"
    echo "📊 Sample contains $(tail -n +2 sample-transactions.csv | wc -l) transactions"
else
    echo "❌ sample-transactions.csv not found"
    echo "Creating a basic test file..."
    cat > test-transactions.csv << EOF
title,amount,fromAccount,toAccount,date,description
Test Import 1,100.00,Income,Main Bank Account,2025-06-21,Test transaction 1
Test Import 2,50.00,Main Bank Account,Food & Dining,2025-06-21,Test transaction 2
EOF
    echo "✅ Created test-transactions.csv with 2 test transactions"
fi

echo ""
echo "🔧 Manual Testing Instructions:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to 'CSV Import' tab"
echo "3. Upload sample-transactions.csv (or test-transactions.csv)"
echo "4. Verify data preview shows correctly"
echo "5. Select the transactions you want to import using checkboxes"
echo "6. Click 'Import X Selected Transactions'"
echo "6. Watch for success message"
echo "7. Navigate to 'Transactions' tab to verify data appears"
echo "8. Check 'Home' tab for updated summaries"

echo ""
echo "🔍 Debugging Tips:"
echo "- Open browser console (F12) to see detailed logs"
echo "- Look for 'CSV Import:' and 'App:' log messages"
echo "- Check for any Firebase errors"
echo "- Use refresh button if data doesn't appear immediately"

echo ""
echo "📋 Expected Console Logs:"
echo "- CSV Import: Starting import of X transactions"
echo "- App: Starting import of X transactions"
echo "- App: Transactions imported to Firebase successfully"
echo "- useFirebaseData: Transaction update received - X transactions"

echo ""
echo "🎯 Success Indicators:"
echo "- No red errors in console"
echo "- Success alert with transaction count"
echo "- Data appears in Transactions page within 2 seconds"
echo "- Account balances update correctly"

echo ""
echo "Ready to test! 🚀"
