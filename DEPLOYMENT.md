# Firebase Hosting Deployment Checklist

## Pre-deployment Setup
- [ ] Firebase project created and configured (`keesha-10560`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] GitHub repository created and connected

## GitHub Integration Setup
- [ ] Run `firebase init hosting:github` to set up GitHub Actions
- [ ] Verify GitHub repository is selected correctly
- [ ] Confirm build directory is set to `build`
- [ ] Enable automatic deployment on push to main/master
- [ ] Enable pull request previews
- [ ] Verify GitHub secret `FIREBASE_SERVICE_ACCOUNT_AI_WALLET_427217` is created

## Testing Deployment
- [ ] Run `npm run build` to verify build works locally
- [ ] Run `npm run serve` to test Firebase hosting locally
- [ ] Push changes to a feature branch and create a PR to test preview deployment
- [ ] Merge PR to test production deployment

## Post-deployment Verification
- [ ] Visit your Firebase hosting URL to verify deployment
- [ ] Check Firebase console for deployment logs
- [ ] Verify GitHub Actions workflows are running successfully
- [ ] Test that new commits trigger automatic deployments

## Useful Commands
```bash
# Local development
npm start                    # Run development server
npm run build               # Build for production
npm run serve              # Test build with Firebase hosting

# Deployment
npm run deploy             # Manual deployment to production
npm run deploy:preview     # Deploy to preview channel
firebase hosting:channel:list  # List all hosting channels

# GitHub Actions setup
firebase init hosting:github   # Initialize GitHub integration
firebase use keesha-10560      # Switch to project (if needed)
```

## Troubleshooting
- If deployment fails, check GitHub Actions logs
- Verify Firebase service account permissions
- Ensure build directory contains valid files
- Check Firebase hosting console for error messages
