# Firebase Hosting Deployment Checklist

## Pre-deployment Setup
- [ ] Firebase project created and configured (`keesha-10560`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)

## Manual Deployment Setup
- [ ] Run `firebase init hosting` to set up Firebase hosting
- [ ] Verify build directory is set to `build`
- [ ] Test local build and deployment

## Testing Deployment
- [ ] Run `npm run build` to verify build works locally
- [ ] Run `npm run serve` to test Firebase hosting locally
- [ ] Deploy manually to test production deployment

## Post-deployment Verification
- [ ] Visit your Firebase hosting URL to verify deployment
- [ ] Check Firebase console for deployment logs
- [ ] Test that manual deployments work correctly

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

# Firebase setup
firebase init hosting         # Initialize Firebase hosting
firebase use keesha-10560    # Switch to project (if needed)
```

## Troubleshooting
- If deployment fails, check Firebase console logs
- Verify Firebase CLI authentication
- Ensure build directory contains valid files
- Check Firebase hosting console for error messages
