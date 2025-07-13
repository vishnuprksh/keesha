#!/bin/bash

echo "🔧 Firebase Rules Deployment Helper"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is available"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase"
    echo "   Please run: firebase login"
    exit 1
fi

echo "✅ Firebase authentication confirmed"

# Check if Firebase project is initialized
if [ ! -f "firebase.json" ]; then
    echo "❌ Firebase project not initialized"
    echo "   Please run: firebase init"
    exit 1
fi

echo "✅ Firebase project is initialized"

# Display current rules
echo ""
echo "📋 Current Firestore Security Rules:"
echo "------------------------------------"
cat firestore.rules
echo ""

# Check if rules include user profile collection
if grep -q "userProfiles" firestore.rules; then
    echo "✅ User profiles collection rules found"
else
    echo "❌ User profiles collection rules missing"
    echo "   The rules may not be updated correctly"
fi

# Ask user if they want to deploy
echo ""
read -p "🚀 Deploy these rules to Firebase? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying Firestore rules..."
    if firebase deploy --only firestore:rules; then
        echo "✅ Firestore rules deployed successfully!"
        echo ""
        echo "🔍 Next steps:"
        echo "1. Check Firebase Console for rule deployment"
        echo "2. Test the user profile creation in your app"
        echo "3. Monitor Firebase logs for permission issues"
    else
        echo "❌ Failed to deploy Firestore rules"
        echo "   Check the Firebase console for error details"
    fi
else
    echo "⏭️ Deployment skipped"
    echo ""
    echo "💡 To deploy rules manually:"
    echo "   firebase deploy --only firestore:rules"
fi

echo ""
echo "🔍 Debug commands:"
echo "   firebase firestore:rules get    # View deployed rules"
echo "   firebase projects:list         # List available projects"
echo "   firebase use --list            # Show current project"
