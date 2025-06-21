# Firebase Authentication Domain Authorization Fix

## Problem
You're getting this error: `FirebaseError: Firebase: Error (auth/unauthorized-domain)`

This happens because Firebase needs to authorize the domains from which OAuth sign-ins can occur.

## Solution

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **keesha-10560**

### Step 2: Navigate to Authentication Settings
1. In the left sidebar, click on **Authentication**
2. Click on the **Settings** tab (next to Users, Templates, etc.)
3. Scroll down to find **Authorized domains** section

### Step 3: Add Development Domains
Add these domains to your authorized domains list:
- `localhost`
- `127.0.0.1`

**Note:** Firebase automatically includes `localhost` for development, but sometimes you need to manually add `127.0.0.1` or specific ports.

### Step 4: Enable Google Sign-In Provider
1. Go to **Authentication** → **Sign-in method** tab
2. Click on **Google** provider
3. Click **Enable**
4. Add your email address as a support email
5. Save the changes

### Step 5: Verify the Changes
After making these changes:
1. Refresh your application in the browser
2. Try signing in with Google again

## Alternative Quick Fix (Development Only)
If you want to test immediately without going to Firebase Console, you can temporarily change your development URL to use `localhost` instead of `127.0.0.1`:

Open your browser and go to: `http://localhost:3000` instead of `127.0.0.1:3000`

## Production Setup
When you deploy to production, make sure to add your production domain to the authorized domains list as well.
