import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from './config';

/**
 * Firebase Authentication Service
 * 
 * Handles user authentication for Devnet
 */

class AuthService {
    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Create new account
     */
    async signUp(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign out
     */
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send password reset email
     */
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return auth.currentUser;
    }

    /**
     * Get user-friendly error messages
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account already exists with this email',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/too-many-requests': 'Too many attempts. Please try again later'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again';
    }
}

export default new AuthService();
export { AuthService };
