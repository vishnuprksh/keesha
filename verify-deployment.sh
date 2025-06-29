#!/bin/bash

echo "🔍 Keesha Deployment Verification Script"
echo "========================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

echo "✅ Git repository detected"

# Check Firebase configuration
echo ""
echo "🔥 Firebase Configuration:"
if [ -f ".firebaserc" ]; then
    echo "✅ .firebaserc exists"
    echo "   Default project: $(cat .firebaserc | grep -o '"default": "[^"]*"' | cut -d'"' -f4)"
else
    echo "❌ .firebaserc not found"
fi

if [ -f "firebase.json" ]; then
    echo "✅ firebase.json exists"
else
    echo "❌ firebase.json not found"
fi

# Check package.json build script
echo ""
echo "📦 Build Configuration:"
if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    if grep -q '"build"' package.json; then
        echo "✅ Build script found"
    else
        echo "❌ Build script not found in package.json"
    fi
else
    echo "❌ package.json not found"
fi

# Check if build directory structure is correct
echo ""
echo "🏗️  Build Directory:"
if [ -d "build" ]; then
    echo "✅ Build directory exists"
else
    echo "ℹ️  Build directory not found (run 'npm run build' to create)"
fi

echo ""
echo "� Next Steps:"
echo "1. Run 'npm run build' to build the application"
echo "2. Run 'npm run deploy' to deploy to Firebase hosting"
echo "3. Visit https://keesha-10560.web.app to see your deployed app"

echo ""
echo "🚀 Ready to deploy!"
