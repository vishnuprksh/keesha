#!/bin/bash

# GitHub Firebase Hosting Setup Script
# This script helps you complete the Firebase hosting integration with GitHub

echo "🔥 Firebase Hosting GitHub Integration Setup"
echo "============================================"
echo

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI is available"
echo

# Check if user is logged in to Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please log in:"
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

echo
echo "📋 Current Firebase project configuration:"
firebase use --current
echo

echo "🚀 Next steps to complete the setup:"
echo
echo "1. Generate Firebase service account for GitHub Actions:"
echo "   Run: firebase init hosting:github"
echo "   - Select your repository when prompted"
echo "   - Choose 'build' as the public directory (already configured)"
echo "   - Choose 'Yes' for single-page app (already configured)"
echo "   - Choose 'Yes' to set up automatic deployment on GitHub"
echo "   - Choose 'Yes' to set up pull request previews"
echo
echo "2. The command above will:"
echo "   ✓ Create a Firebase service account"
echo "   ✓ Add the service account key as a GitHub secret"
echo "   ✓ Create/update GitHub Actions workflow files"
echo
echo "3. After running the command, your repository will be ready for:"
echo "   ✓ Automatic deployment on push to main/master"
echo "   ✓ Preview deployments for pull requests"
echo
echo "🔧 Manual deployment commands available:"
echo "   npm run deploy          - Build and deploy to production"
echo "   npm run deploy:preview  - Deploy to preview channel"
echo "   npm run serve          - Test locally with Firebase hosting"
echo
echo "📚 For more information, see the updated README.md file"
