#!/bin/bash

# Script to re-enable optimized Firebase queries once indexes are built

echo "🔧 Re-enabling optimized Firebase queries with database sorting..."

# Check if Firebase indexes are ready
echo "📊 Checking Firebase index status..."
echo "Please visit: https://console.firebase.google.com/project/keesha-10560/firestore/indexes"
echo "Ensure all indexes show 'Enabled' status before running this script."

read -p "Are all indexes enabled? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please wait for indexes to be built before enabling optimized queries."
    exit 1
fi

# Backup current firebaseService.ts
cp src/firebaseService.ts src/firebaseService.ts.backup

echo "✅ Backed up current firebaseService.ts"

# Replace queries to use database sorting instead of in-memory sorting
sed -i 's/where('\''userId'\'', '\''=='\'', userId)/where('\''userId'\'', '\''=='\'', userId),\n      orderBy('\''date'\'', '\''desc'\'')/' src/firebaseService.ts
sed -i 's/where('\''userId'\'', '\''=='\'', userId)/where('\''userId'\'', '\''=='\'', userId),\n      orderBy('\''name'\'')/' src/firebaseService.ts

# Remove in-memory sorting comments and code
sed -i '/\/\/ Note: Removed orderBy to avoid requiring composite index/d' src/firebaseService.ts
sed -i '/\/\/ Sort in memory by date descending/,/transactions\.sort.*);/d' src/firebaseService.ts
sed -i '/\/\/ Sort in memory by name/,/accounts\.sort.*);/d' src/firebaseService.ts

echo "✅ Updated Firebase queries to use database sorting"
echo "🚀 Optimized queries are now enabled!"
echo ""
echo "Note: If you encounter index errors, restore the backup:"
echo "cp src/firebaseService.ts.backup src/firebaseService.ts"
