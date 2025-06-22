# 💰 Keesha
AI powered wallet - Your Personal Expense Tracker

## 🔥 Firebase Integration

Keesha now supports Firebase for real-time data synchronization across devices. Your transactions and accounts are automatically synced and backed up to the cloud.

### Features
- ✅ Real-time data synchronization
- ✅ Automatic localStorage migration
- ✅ Offline support with automatic sync
- ✅ Cross-device accessibility
- ✅ Secure cloud backup
- ✅ Auto-save feature

### Quick Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy your Firebase configuration to `.env` file
4. Run `npm start`

📖 **Detailed setup instructions:** See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## Firebase Hosting & GitHub Integration

This project is configured for automatic deployment to Firebase Hosting using GitHub Actions.

### Setup Instructions

1. **Firebase Project Setup**
   - Project ID: `ai-wallet-427217`
   - Hosting configured to deploy from the `build` folder

2. **GitHub Actions Workflows**
   - **Merge Deploy**: Automatically deploys to production when code is pushed to `main` or `master` branch
   - **Preview Deploy**: Creates preview deployments for pull requests

3. **Required GitHub Secrets**
   To enable automatic deployment, you need to add the following secret to your GitHub repository:
   
   - `FIREBASE_SERVICE_ACCOUNT_AI_WALLET_427217`: Firebase service account key
   
   **To generate the service account key:**
   ```bash
   firebase login
   firebase init hosting:github
   ```

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to Firebase hosting
- `npm run deploy:preview` - Deploy to preview channel
- `npm run serve` - Serve build locally using Firebase hosting

### Manual Deployment

To deploy manually:
```bash
npm run build
firebase deploy --only hosting
```

### Preview Channels

Create a preview channel:
```bash
npm run deploy:preview
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Optional: Use Firestore emulator in development
# REACT_APP_USE_FIRESTORE_EMULATOR=true
```

### Development vs Production

- **Without Firebase**: The app falls back to localStorage for data storage
- **With Firebase**: Real-time sync, cloud backup, and cross-device access
- **Migration**: Existing localStorage data is automatically migrated to Firebase

### CSV Import Auto-Save

The CSV import feature includes intelligent auto-save functionality:

- **Automatic persistence**: Imported CSV data is automatically saved to localStorage
- **Navigation-safe**: Data persists when switching between pages or creating accounts
- **24-hour retention**: Auto-saved data expires after 24 hours to prevent clutter
- **Visual indicators**: Shows when data is being saved and when restored
- **Manual control**: Clear button to manually remove auto-saved data
- **Smart restoration**: Only restores recent, non-expired data

This ensures you never lose your CSV import progress, even if you need to navigate away to create missing accounts or make other changes.

## 🛠️ Development
