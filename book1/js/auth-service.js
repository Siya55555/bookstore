// Authentication Service
// Handles user registration, login, profile management, and Google Sign-In

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    updateProfile,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { auth, db, storage, googleProvider } from './firebase-config.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.initAuthStateListener();
    }

    // Initialize authentication state listener
    initAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            if (user) {
                // Get user profile from Firestore
                const userProfile = await this.getUserProfile(user.uid);
                this.currentUser = { ...user, ...userProfile };
            }
            this.notifyAuthStateListeners(user);
        });
    }

    // Register new user with email and password
    async registerUser(email, password, name, bio = "") {
        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, { displayName: name });

            // Create user profile in Firestore
            const userProfile = {
                name: name,
                email: email,
                bio: bio,
                profileImageURL: null,
                createdAt: new Date(),
                lastLogin: new Date()
            };

            await this.createUserProfile(user.uid, userProfile);

            return { success: true, user: { ...user, ...userProfile } };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Login with email and password
    async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update last login time
            await this.updateLastLogin(user.uid);

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Google Sign-In
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user profile exists, if not create one
            const userProfile = await this.getUserProfile(user.uid);
            if (!userProfile) {
                const newProfile = {
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    bio: "",
                    profileImageURL: user.photoURL,
                    createdAt: new Date(),
                    lastLogin: new Date()
                };
                await this.createUserProfile(user.uid, newProfile);
            } else {
                await this.updateLastLogin(user.uid);
            }

            return { success: true, user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Logout user
    async logoutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Create user profile in Firestore
    async createUserProfile(uid, profile) {
        try {
            await setDoc(doc(db, 'users', uid), profile);
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    }

    // Get user profile from Firestore
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Update user profile
    async updateUserProfile(uid, updates) {
        try {
            await updateDoc(doc(db, 'users', uid), updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update last login time
    async updateLastLogin(uid) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                lastLogin: new Date()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Upload profile image
    async uploadProfileImage(uid, file) {
        try {
            const storageRef = ref(storage, `profile-images/${uid}/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            // Update user profile with new image URL
            await this.updateUserProfile(uid, { profileImageURL: downloadURL });
            
            return { success: true, imageURL: downloadURL };
        } catch (error) {
            console.error('Error uploading profile image:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Add auth state listener
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
    }

    // Notify all auth state listeners
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => callback(user));
    }

    // Get user-friendly error messages
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'default': 'An error occurred. Please try again.'
        };
        return errorMessages[errorCode] || errorMessages['default'];
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService; 