import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const form = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const errorContainer = document.getElementById('error-message');
const loader = document.getElementById('loader');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        showError("Passwords do not match.");
        return;
    }

    showLoader(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        await updateProfile(userCredential.user, {
            displayName: nameInput.value
        });
        window.location.href = 'profile.html';
    } catch (error) {
        handleAuthError(error);
    } finally {
        showLoader(false);
    }
});

function handleAuthError(error) {
    let message = 'An unknown error occurred. Please try again.';
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please login.';
            break;
        case 'auth/weak-password':
            message = 'The password is too weak. Please use at least 6 characters.';
            break;
        case 'auth/invalid-email':
            message = 'Please enter a valid email address.';
            break;
    }
    showError(message);
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

function showLoader(isLoading) {
    loader.style.display = isLoading ? 'block' : 'none';
} 