# Firebase Permissions Error - Debugging Guide

## 🚨 Current Issue
```
firebaseService.ts:501 Error listening to user profile: FirebaseError: Missing or insufficient permissions.
```

## 🔍 Root Cause Analysis

The error occurs because:
1. **Firebase Security Rules Not Deployed**: The updated `firestore.rules` with user profile collection may not be deployed to Firebase
2. **Collection Access Pattern**: The user profile document might not exist yet, causing permission issues
3. **Authentication State**: The user might not be properly authenticated when accessing the profile

## 🛠️ Immediate Fixes Applied

### 1. Enhanced Logging
- ✅ Added comprehensive logging to `userProfileService`
- ✅ Added logging to `useUserProfile` hook
- ✅ Added logging to App.tsx onboarding handlers

### 2. Error Handling
- ✅ Added specific permission error detection
- ✅ Added graceful fallback for missing profiles
- ✅ Added proper error propagation

### 3. Deployment Helper
- ✅ Created `deploy-firestore-rules.sh` script to deploy rules

## 🚀 Next Steps to Resolve

### Step 1: Deploy Firebase Rules
```bash
# Run the deployment script
./deploy-firestore-rules.sh

# Or deploy manually
firebase deploy --only firestore:rules
```

### Step 2: Verify Current Rules in Firebase Console
1. Go to Firebase Console → Firestore Database → Rules
2. Check if the rules include:
```javascript
match /userProfiles/{userId} {
  allow read, write, update, delete: if request.auth != null && 
                    userId == request.auth.uid;
  allow create: if request.auth != null && 
               userId == request.auth.uid;
}
```

### Step 3: Test User Profile Creation
1. Open browser dev tools
2. Watch for the new logging messages
3. Look for these log patterns:
   - `🔍 UserProfile: Setting up subscription for user {userId}`
   - `🔧 UserProfile: Creating profile for user {userId}`
   - `✅ UserProfile: Profile created successfully`

## 🔧 Temporary Workaround

If the rules deployment doesn't immediately fix the issue, you can temporarily modify the security rules to be more permissive for testing:

### Temporary Rules (TESTING ONLY)
```javascript
// TEMPORARY - DO NOT USE IN PRODUCTION
match /userProfiles/{userId} {
  allow read, write: if request.auth != null;
}
```

**⚠️ Important**: Revert to proper user-specific rules after testing!

## 🐛 Debug Information to Collect

When testing, look for these specific log messages:

### Expected Flow for New User:
```
🔍 UserProfile Hook: Initializing for user {userId}
🔧 UserProfile Hook: Setting up real-time listener for user {userId}  
🔍 UserProfile: Setting up subscription for user {userId}
📄 UserProfile: Document snapshot received for user {userId}
📄 UserProfile: Document exists: false
❌ UserProfile: No profile found for user {userId}
🚀 App: Starting onboarding completion
🔧 App: Creating user profile (profile does not exist)
🔧 UserProfile: Creating profile for user {userId}
💾 UserProfile: Saving profile to Firestore...
✅ UserProfile: Profile created successfully for user {userId}
```

### Error Pattern to Watch For:
```
🚨 UserProfile: Error listening to user profile for {userId}: [error]
🚨 UserProfile: Error code: permission-denied
🚨 UserProfile: Permission denied - check Firebase security rules
```

## 🔍 Manual Testing Steps

1. **Clear Browser Cache**: Clear all Firebase/app data
2. **Fresh Login**: Sign out and sign in again
3. **Monitor Console**: Watch for the detailed log messages
4. **Check Firebase Console**: Verify rules are deployed correctly

## 🎯 Success Indicators

You'll know it's working when you see:
- No permission errors in console
- User profile creation logs
- Onboarding wizard appears for new users
- Smooth transition to main app after onboarding

## 📞 If Issues Persist

1. **Check Firebase Project Settings**: Ensure correct project is selected
2. **Verify Authentication**: Make sure Google Auth is properly configured
3. **Test with Firebase Emulator**: Use local emulator for rule testing
4. **Check Network Tab**: Look for 403 errors in browser network tab

## 🔄 Rollback Plan

If issues persist, you can temporarily disable user profiles:
1. Comment out the user profile checks in App.tsx
2. Remove the profile creation calls
3. Let users access the app directly without onboarding
4. Fix the rules issue separately
