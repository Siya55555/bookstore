// Firebase Configuration and Initialization
// This file sets up all Firebase services needed for the bookstore application

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_6dQXMmNIAtsnV_OVtRMquKTCXaphUuE",
  authDomain: "bookstore-app-e726b.firebaseapp.com",
  projectId: "bookstore-app-e726b",
  storageBucket: "bookstore-app-e726b.firebasestorage.app",
  messagingSenderId: "64240226965",
  appId: "1:64240226965:web:c1bc431b00446f81bc819c",
  measurementId: "G-JGZJXC1FHN"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google Auth Provider for Google Sign-In
const googleProvider = new GoogleAuthProvider();

// Export all Firebase services for use in other modules
export { auth, db, storage, googleProvider }; 