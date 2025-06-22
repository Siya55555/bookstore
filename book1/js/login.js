import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorContainer = document.getElementById('error-message');
const loader = document.getElementById('loader');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
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
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            message = 'Invalid email or password.';
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