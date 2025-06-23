// Login Page JavaScript
// Handles user authentication and login functionality

import authService from './auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const loginButton = loginForm.querySelector('button[type="submit"]');

    // Check if user is already logged in
    if (authService.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Validate inputs
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            // Attempt login
            const result = await authService.loginUser(email, password);
            
            if (result.success) {
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userEmail', email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userEmail');
                }

                // Redirect to home page
                window.location.href = 'index.html';
            } else {
                showError(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('An unexpected error occurred. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Google Sign-In button (if exists)
    const googleSignInBtn = document.querySelector('.google-signin-btn');
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            setLoadingState(true);

            try {
                const result = await authService.signInWithGoogle();
                
                if (result.success) {
                    window.location.href = 'index.html';
                } else {
                    showError(result.error);
                }
            } catch (error) {
                console.error('Google sign-in error:', error);
                showError('Google sign-in failed. Please try again.');
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Load remembered email if exists
    loadRememberedEmail();

    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function setLoadingState(loading) {
        if (loading) {
            loader.style.display = 'inline-block';
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';
        } else {
            loader.style.display = 'none';
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function loadRememberedEmail() {
        const rememberMe = localStorage.getItem('rememberMe');
        const savedEmail = localStorage.getItem('userEmail');
        
        if (rememberMe === 'true' && savedEmail) {
            emailInput.value = savedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Add some visual feedback
    emailInput.addEventListener('focus', () => {
        emailInput.parentElement.classList.add('focused');
    });

    emailInput.addEventListener('blur', () => {
        if (!emailInput.value) {
            emailInput.parentElement.classList.remove('focused');
        }
    });

    passwordInput.addEventListener('focus', () => {
        passwordInput.parentElement.classList.add('focused');
    });

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value) {
            passwordInput.parentElement.classList.remove('focused');
        }
    });

    // Password visibility toggle (if exists)
    const passwordToggle = document.querySelector('.password-toggle');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            passwordToggle.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    }
}); 