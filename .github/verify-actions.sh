#!/bin/bash

# GitHub Actions Verification Script
# Validates GitHub Actions setup and configuration

set -e

echo "🔍 GitHub Actions Setup Verification"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Checking workflow files...${NC}"

# Check if .github/workflows directory exists
if [ ! -d ".github/workflows" ]; then
    echo -e "${RED}❌ .github/workflows directory not found${NC}"
    exit 1
fi

# List of expected workflow files
WORKFLOWS=(
    "ci.yml"
    "firebase-hosting-merge.yml"
    "firebase-hosting-pull-request.yml"
    "release.yml"
    "code-quality.yml"
    "maintenance.yml"
)

MISSING_WORKFLOWS=()
FOUND_WORKFLOWS=()

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f ".github/workflows/$workflow" ]; then
        echo -e "${GREEN}✅ $workflow${NC}"
        FOUND_WORKFLOWS+=("$workflow")
    else
        echo -e "${RED}❌ $workflow (missing)${NC}"
        MISSING_WORKFLOWS+=("$workflow")
    fi
done

echo ""
echo -e "${BLUE}📋 Configuration validation...${NC}"

# Check package.json scripts
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json found${NC}"
    
    # Check for required scripts
    REQUIRED_SCRIPTS=("build" "test" "start")
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if grep -q "\"$script\":" package.json; then
            echo -e "${GREEN}  ✅ npm script: $script${NC}"
        else
            echo -e "${RED}  ❌ npm script missing: $script${NC}"
        fi
    done
else
    echo -e "${RED}❌ package.json not found${NC}"
fi

# Check Firebase configuration
if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅ firebase.json found${NC}"
else
    echo -e "${YELLOW}⚠️  firebase.json not found${NC}"
fi

if [ -f ".firebaserc" ]; then
    echo -e "${GREEN}✅ .firebaserc found${NC}"
    
    # Extract project ID
    PROJECT_ID=$(cat .firebaserc | grep -o '"default":\s*"[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        echo -e "${GREEN}  ✅ Firebase project: $PROJECT_ID${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .firebaserc not found${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Security requirements...${NC}"

# Check for GitHub secrets documentation
if grep -r "FIREBASE_SERVICE_ACCOUNT" .github/workflows/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Firebase service account secret referenced${NC}"
    echo -e "${YELLOW}  ⚠️  Verify FIREBASE_SERVICE_ACCOUNT_KEESHA_10560 is set in GitHub repo secrets${NC}"
else
    echo -e "${RED}❌ Firebase service account secret not found in workflows${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Workflow syntax validation...${NC}"

# Basic YAML syntax check for workflow files
YAML_ERRORS=0
for workflow in "${FOUND_WORKFLOWS[@]}"; do
    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('.github/workflows/$workflow'))" 2>/dev/null; then
            echo -e "${GREEN}✅ $workflow (valid YAML)${NC}"
        else
            echo -e "${RED}❌ $workflow (invalid YAML)${NC}"
            YAML_ERRORS=$((YAML_ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  $workflow (cannot validate YAML - python3 not available)${NC}"
    fi
done

echo ""
echo -e "${BLUE}📊 Summary...${NC}"
echo "=============="

echo "Found workflows: ${#FOUND_WORKFLOWS[@]}"
echo "Missing workflows: ${#MISSING_WORKFLOWS[@]}"
echo "YAML errors: $YAML_ERRORS"

if [ ${#MISSING_WORKFLOWS[@]} -eq 0 ] && [ $YAML_ERRORS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 GitHub Actions setup looks good!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Ensure GitHub repository secrets are configured"
    echo "2. Push changes to trigger workflows"
    echo "3. Monitor first workflow runs for any issues"
    echo ""
    echo -e "${BLUE}Required GitHub Secrets:${NC}"
    echo "- FIREBASE_SERVICE_ACCOUNT_KEESHA_10560"
    echo ""
    echo -e "${BLUE}Optional GitHub Secrets (for enhanced features):${NC}"
    echo "- CODECOV_TOKEN (test coverage)"
    echo "- SNYK_TOKEN (security scanning)"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Issues found that need attention:${NC}"
    
    if [ ${#MISSING_WORKFLOWS[@]} -gt 0 ]; then
        echo "Missing workflows:"
        for workflow in "${MISSING_WORKFLOWS[@]}"; do
            echo "  - $workflow"
        done
    fi
    
    if [ $YAML_ERRORS -gt 0 ]; then
        echo "YAML syntax errors in $YAML_ERRORS workflow(s)"
    fi
    
    exit 1
fi
