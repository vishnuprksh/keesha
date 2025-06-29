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

# Check GitHub Actions workflows
echo ""
echo "⚙️  GitHub Actions Workflows:"
if [ -f ".github/workflows/firebase-hosting-merge.yml" ]; then
    echo "✅ Merge workflow exists"
    project_id=$(grep "projectId:" .github/workflows/firebase-hosting-merge.yml | awk '{print $2}')
    echo "   Target project: $project_id"
else
    echo "❌ Merge workflow not found"
fi

if [ -f ".github/workflows/firebase-hosting-pull-request.yml" ]; then
    echo "✅ PR workflow exists"
else
    echo "❌ PR workflow not found"
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
echo "🔐 Required GitHub Secrets:"
echo "   FIREBASE_SERVICE_ACCOUNT_KEESHA_10560"
echo "   (This must be set manually in GitHub repository settings)"

echo ""
echo "📋 Next Steps:"
echo "1. Ensure the GitHub secret is set up"
echo "2. Push changes to trigger deployment"
echo "3. Check GitHub Actions tab for deployment status"
echo "4. Visit https://keesha-10560.web.app to see your deployed app"

echo ""
echo "🚀 Ready to deploy!"
