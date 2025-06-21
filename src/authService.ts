import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const authService = {
  // Sign in with Google
  async signInWithGoogle(): Promise<AuthUser> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by browser. Please allow popups and try again.');
      } else {
        throw new Error('Failed to sign in with Google');
      }
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Authentication is not configured');
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    if (!isFirebaseConfigured || !auth) {
      return null;
    }
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => {};
    }

    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        callback(null);
      }
    });
  }
};
