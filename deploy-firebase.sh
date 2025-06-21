#!/bin/bash

# Keesha Firebase Deployment Script
# This script helps deploy Keesha with Firebase integration

echo "🚀 Keesha Firebase Deployment Setup"
echo "=================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in to Firebase
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please login to Firebase:"
    firebase login
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "🔧 Please edit the .env file with your Firebase configuration:"
    echo "   1. Go to https://console.firebase.google.com/"
    echo "   2. Select your project"
    echo "   3. Go to Project Settings"
    echo "   4. Find your web app configuration"
    echo "   5. Copy the values to .env file"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Check if Firebase project is initialized
if [ ! -f firebase.json ]; then
    echo "🔥 Initializing Firebase project..."
    firebase init
else
    echo "✅ Firebase project already initialized"
fi

# Build the project
echo "🏗️  Building the project..."
npm run build

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Set up Firestore security rules"
echo "   2. Test the application"
echo "   3. Configure authentication (optional)"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - FIREBASE_SETUP.md"
echo "   - README.md"
