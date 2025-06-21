# Firebase Integration Guide for Keesha

This guide will help you set up Firebase integration for your Keesha expense tracker application.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Firestore database enabled in your Firebase project

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard to create your project

### 2. Enable Firestore Database

1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for now (you can configure security rules later)
4. Select a location for your database

### 3. Get Your Firebase Configuration

1. In your Firebase project console, click on the gear icon and select "Project settings"
2. Scroll down to "Your apps" section
3. Click on "Web app" icon (</>) to create a web app
4. Register your app with a name (e.g., "Keesha Expense Tracker")
5. Copy the configuration object from the Firebase SDK snippet

### 4. Configure Environment Variables

Create a `.env` file in your project root and add your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Important:** Never commit your `.env` file to version control. Add it to your `.gitignore` file.

### 5. Install Dependencies

The Firebase SDK is already included in your package.json. If you need to install it manually:

```bash
npm install firebase
```

### 6. Start the Application

```bash
npm start
```

## Features

### Real-time Data Sync
- All transactions and accounts are automatically synced across devices
- Changes are reflected in real-time across all connected clients

### Data Migration
- Existing localStorage data will be automatically migrated to Firebase on first run
- Migration happens seamlessly in the background

### Offline Support
- Firebase provides built-in offline support
- Data is cached locally and synced when connection is restored

## Data Structure

### Transactions Collection
```typescript
interface Transaction {
  id: string;
  title: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Accounts Collection
```typescript
interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules

Update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users for now
    // TODO: Add proper authentication and user-specific rules
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules allow public access. In production, you should implement proper authentication and user-specific rules.

## Troubleshooting

### Firebase Not Configured Error
- Ensure all environment variables are set correctly
- Check that your Firebase project has Firestore enabled
- Verify your Firebase configuration values

### Permission Denied Errors
- Check your Firestore security rules
- Ensure the rules allow the operations you're trying to perform

### Connection Issues
- Check your internet connection
- Verify your Firebase project is active
- Check the browser console for detailed error messages

## Advanced Configuration

### Using Firestore Emulator (Development)
Add this to your `.env` file to use the local Firestore emulator:

```env
REACT_APP_USE_FIRESTORE_EMULATOR=true
```

Then start the emulator:
```bash
firebase emulators:start --only firestore
```

### Backup and Export
You can export your Firestore data using the Firebase CLI:

```bash
gcloud firestore export gs://your-bucket-name/backup-folder
```

## Support

If you encounter any issues with Firebase integration, please check:
1. [Firebase Documentation](https://firebase.google.com/docs)
2. [Firestore Documentation](https://firebase.google.com/docs/firestore)
3. The browser console for error messages
