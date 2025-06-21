#!/bin/bash

# Firebase Console Setup Helper
# This script provides direct links to configure Firebase for your Keesha app

echo "🔥 Firebase Setup Helper for Keesha"
echo "=================================="
echo ""
echo "Your Firebase project: keesha-10560"
echo ""
echo "📋 Setup Steps:"
echo ""
echo "1. AUTHORIZE DOMAINS (Fix current error):"
echo "   👉 https://console.firebase.google.com/project/keesha-10560/authentication/settings"
echo "   - Add 'localhost' and '127.0.0.1' to Authorized domains"
echo ""
echo "2. ENABLE GOOGLE SIGN-IN:"
echo "   👉 https://console.firebase.google.com/project/keesha-10560/authentication/providers"
echo "   - Click on Google provider"
echo "   - Toggle 'Enable'"
echo "   - Add your email as support email"
echo "   - Save"
echo ""
echo "3. SETUP FIRESTORE DATABASE:"
echo "   👉 https://console.firebase.google.com/project/keesha-10560/firestore"
echo "   - Create database if not exists"
echo "   - Start in test mode (for development)"
echo ""
echo "4. DEPLOY SECURITY RULES (Optional - for production):"
echo "   Run: firebase deploy --only firestore:rules"
echo ""
echo "After completing these steps, refresh your app and try signing in again!"
echo ""

# Check if we're in a terminal that supports opening URLs
if command -v xdg-open &> /dev/null; then
    echo "🌐 Would you like to open the Firebase Console? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Opening Firebase Console..."
        xdg-open "https://console.firebase.google.com/project/keesha-10560/authentication/settings"
    fi
elif command -v open &> /dev/null; then
    echo "🌐 Would you like to open the Firebase Console? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Opening Firebase Console..."
        open "https://console.firebase.google.com/project/keesha-10560/authentication/settings"
    fi
else
    echo "💡 Copy and paste the links above into your browser to configure Firebase."
fi
