# GitHub Actions Configuration for Keesha Expense Tracker

This directory contains GitHub Actions workflows for automating various aspects of the development and deployment process.

## 🚀 Workflows Overview

### Core Workflows

#### 1. **Continuous Integration** (`ci.yml`)
- **Triggers**: Push/PR to main branches
- **Purpose**: Run tests, linting, type checking, and security scans
- **Features**:
  - Multi-Node.js version testing (18, 20)
  - Test coverage reporting
  - Security vulnerability scanning
  - TypeScript type checking
  - Build artifact generation

#### 2. **Production Deployment** (`firebase-hosting-merge.yml`)
- **Triggers**: Push to main/master, manual dispatch
- **Purpose**: Deploy to production Firebase hosting
- **Features**:
  - Waits for CI to pass
  - Production environment protection
  - Build validation
  - Deployment status notifications

#### 3. **Preview Deployment** (`firebase-hosting-pull-request.yml`)
- **Triggers**: Pull requests to main/master
- **Purpose**: Deploy preview versions for testing
- **Features**:
  - Fast tests before deployment
  - 7-day preview expiration
  - Automatic PR comments with preview URLs
  - Preview environment isolation

### Advanced Workflows

#### 4. **Release Management** (`release.yml`)
- **Triggers**: Git tags, manual dispatch
- **Purpose**: Create releases and deploy release versions
- **Features**:
  - Automatic changelog generation
  - GitHub release creation
  - Production deployment with release info
  - Version tracking

#### 5. **Code Quality Analysis** (`code-quality.yml`)
- **Triggers**: Push, PR, weekly schedule
- **Purpose**: Deep code analysis and quality metrics
- **Features**:
  - ESLint and Prettier checks
  - TypeScript strict mode analysis
  - Bundle size analysis
  - Dependency usage audit
  - Accessibility testing with axe-core
  - Code metrics reporting

#### 6. **Maintenance & Monitoring** (`maintenance.yml`)
- **Triggers**: Daily schedule, manual dispatch
- **Purpose**: Automated maintenance tasks
- **Features**:
  - Security audits
  - Dependency update checks
  - Performance monitoring
  - Backup verification
  - Automated issue creation for maintenance tasks

## 📋 Required GitHub Secrets

Configure these secrets in your repository settings (`Settings → Secrets and variables → Actions`):

### Essential Secrets
- `FIREBASE_SERVICE_ACCOUNT_KEESHA_10560` - Firebase service account JSON (Required)
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional Secrets (for enhanced features)
- `CODECOV_TOKEN` - For test coverage reporting
- `SNYK_TOKEN` - For enhanced security scanning

## 🔧 Environment Configuration

### Production Environment
- **Name**: `production`
- **URL**: https://keesha-10560.web.app
- **Protection**: Manual approval (optional)

### Preview Environment
- **Name**: `preview`
- **URL**: Dynamic Firebase preview URLs
- **Protection**: None (auto-deploy)

## 📊 Workflow Dependencies

```
Push to main/master
    ↓
CI Workflow (tests, linting, security)
    ↓
Production Deployment (waits for CI)
    ↓
Release Management (on tags)

Pull Request
    ↓
CI Workflow
    ↓
Preview Deployment
    ↓
Code Quality Analysis
```

## 🛠️ Manual Workflow Triggers

All workflows support manual triggering via GitHub Actions UI:

1. **Production Deployment**: Emergency deployments
2. **Release Management**: Create releases outside of normal tagging
3. **Maintenance Tasks**: Run specific maintenance operations
4. **Code Quality**: Ad-hoc code analysis

## 📈 Monitoring and Notifications

### Automatic Notifications
- PR comments with preview URLs
- Release notes with deployment status
- Issue creation for maintenance alerts
- Code quality reports on PRs

### Artifacts Generated
- Test coverage reports
- Security audit results
- Bundle analysis reports
- Accessibility audit results
- Code metrics and dependency analysis

## 🔒 Security Features

- **Dependency scanning**: npm audit + Snyk integration
- **Vulnerability alerts**: Automated security issue detection
- **Branch protection**: CI must pass before merge
- **Environment secrets**: Secure deployment credentials
- **Preview isolation**: Safe testing environment

## 📝 Best Practices Implemented

1. **Fast Feedback**: Quick CI runs with parallel jobs
2. **Progressive Enhancement**: Optional features don't block core functionality
3. **Artifact Preservation**: Important build outputs saved for analysis
4. **Environment Isolation**: Separate preview/production deployments
5. **Automated Maintenance**: Proactive dependency and security management
6. **Documentation**: Clear workflow purposes and requirements

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**: Check Firebase service account secret
2. **CI Timeouts**: Review test performance and node version compatibility
3. **Preview URLs Not Working**: Verify Firebase hosting configuration
4. **Security Scan Failures**: Check for critical vulnerabilities in dependencies

### Debug Commands

```bash
# Check workflow status
gh workflow list

# View workflow runs
gh run list --workflow=ci.yml

# Download workflow artifacts
gh run download [run-id]
```

## 🔄 Workflow Maintenance

### Regular Tasks
- Review dependency update issues (created automatically)
- Monitor security audit results
- Check code quality trends
- Verify backup and deployment health

### Quarterly Reviews
- Update Node.js versions in workflows
- Review and update security scanning tools
- Optimize build and test performance
- Update workflow documentation
