#!/bin/bash

echo "🔧 Firebase Rules - Immediate Fix"
echo "================================="

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found"
    echo "   This script must be run from the project root"
    exit 1
fi

echo "📋 Current Firebase project configuration:"
if command -v firebase &> /dev/null; then
    firebase use
else
    echo "❌ Firebase CLI not available"
fi

echo ""
echo "🚀 OPTION 1: Quick Manual Fix"
echo "-----------------------------"
echo "1. Go to Firebase Console: https://console.firebase.google.com"
echo "2. Select your project"
echo "3. Go to Firestore Database → Rules"
echo "4. Replace the rules with:"
echo ""
cat << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles collection
    match /userProfiles/{userId} {
      allow read, write, update, delete: if request.auth != null && 
                        userId == request.auth.uid;
      allow create: if request.auth != null && 
               userId == request.auth.uid;
    }
    
    // Transactions collection
    match /transactions/{document} {
      allow read, write, update, delete: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // Accounts collection  
    match /accounts/{document} {
      allow read, write, update, delete: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
    }
    
    // CSV import sessions collection
    match /csvImports/{document} {
      allow read, write, update, delete: if request.auth != null && 
                        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
    }
  }
}
EOF

echo ""
echo "5. Click 'Publish'"
echo ""

echo "🔄 OPTION 2: Temporary Development Rules (INSECURE - DEV ONLY)"
echo "--------------------------------------------------------------"
echo "If you need to test immediately, you can temporarily use these rules:"
echo ""
cat << 'EOF'
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY - REMOVE AFTER TESTING
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
EOF

echo ""
echo "⚠️  WARNING: These temporary rules are NOT secure for production!"
echo "⚠️  Revert to proper user-specific rules after testing!"
echo ""

echo "💻 OPTION 3: Command Line Deployment"
echo "------------------------------------"
if command -v firebase &> /dev/null; then
    echo "✅ Firebase CLI is available"
    echo ""
    echo "To deploy the rules via command line:"
    echo "1. Authenticate: firebase login"
    echo "2. Deploy rules: firebase deploy --only firestore:rules"
    echo ""
    read -p "🚀 Deploy rules now? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        if [ $? -eq 0 ]; then
            echo "✅ Rules deployed successfully!"
            echo "🎉 Your app should now work without permission errors"
            echo ""
            echo "📊 Expected behavior after deployment:"
            echo "- No more permission errors in console"
            echo "- Onboarding wizard works properly"
            echo "- User profiles are created successfully"
        else
            echo "❌ Failed to deploy rules"
            echo "   Try manual deployment via Firebase Console"
        fi
    else
        echo "⏭️ Deployment skipped"
    fi
else
    echo "❌ Firebase CLI not available"
    echo "   Install with: npm install -g firebase-tools"
    echo "   Or use manual deployment via Firebase Console"
fi

echo ""
echo "🔍 What to expect after deploying the correct rules:"
echo "----------------------------------------------------"
echo "✅ Console logs will show:"
echo "   📄 UserProfile: Document exists: false"
echo "   🔧 UserProfile: Creating profile for user {userId}"
echo "   ✅ UserProfile: Profile created successfully"
echo ""
echo "✅ App behavior:"
echo "   - Onboarding wizard appears and works"
echo "   - User can complete account setup"
echo "   - No more permission errors"
echo ""
echo "🆘 If you still see permission errors after deployment:"
echo "   1. Wait 2-3 minutes for rule propagation"
echo "   2. Clear browser cache and refresh"
echo "   3. Check Firebase Console to verify rules are actually deployed"
