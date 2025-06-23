// Signup Page JavaScript
// Handles user registration and account creation

import authService from './auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const bioInput = document.getElementById('bio');
    const errorMessage = document.getElementById('error-message');
    const loader = document.getElementById('loader');
    const signupButton = signupForm.querySelector('button[type="submit"]');

    // Check if user is already logged in
    if (authService.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Handle form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const bio = bioInput.value.trim();

        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            showError('Please fill in all required fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (name.length < 2) {
            showError('Name must be at least 2 characters long');
            return;
        }

        // Show loading state
        setLoadingState(true);

        try {
            // Attempt registration
            const result = await authService.registerUser(email, password, name, bio);
            
            if (result.success) {
                // Show success message
                showSuccess('Account created successfully! Redirecting...');
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showError(result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An unexpected error occurred. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Google Sign-Up button (if exists)
    const googleSignUpBtn = document.querySelector('.google-signup-btn');
    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', async (e) => {
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
                console.error('Google sign-up error:', error);
                showError('Google sign-up failed. Please try again.');
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Real-time password validation
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Helper functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-danger';
        errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.className = 'alert alert-success';
        errorMessage.style.display = 'block';
    }

    function setLoadingState(loading) {
        if (loading) {
            loader.style.display = 'inline-block';
            signupButton.disabled = true;
            signupButton.textContent = 'Creating Account...';
        } else {
            loader.style.display = 'none';
            signupButton.disabled = false;
            signupButton.textContent = 'Sign Up';
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword() {
        const password = passwordInput.value;
        const strengthIndicator = document.getElementById('password-strength');
        
        if (!strengthIndicator) return;

        let strength = 0;
        let feedback = '';

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        switch (strength) {
            case 0:
            case 1:
                feedback = 'Very Weak';
                strengthIndicator.className = 'text-danger';
                break;
            case 2:
                feedback = 'Weak';
                strengthIndicator.className = 'text-warning';
                break;
            case 3:
                feedback = 'Fair';
                strengthIndicator.className = 'text-info';
                break;
            case 4:
                feedback = 'Good';
                strengthIndicator.className = 'text-primary';
                break;
            case 5:
            case 6:
                feedback = 'Strong';
                strengthIndicator.className = 'text-success';
                break;
        }

        strengthIndicator.textContent = feedback;
    }

    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const matchIndicator = document.getElementById('password-match');
        
        if (!matchIndicator) return;

        if (confirmPassword === '') {
            matchIndicator.textContent = '';
            matchIndicator.className = '';
        } else if (password === confirmPassword) {
            matchIndicator.textContent = 'Passwords match';
            matchIndicator.className = 'text-success';
        } else {
            matchIndicator.textContent = 'Passwords do not match';
            matchIndicator.className = 'text-danger';
        }
    }

    // Add visual feedback for form fields
    const formFields = [nameInput, emailInput, passwordInput, confirmPasswordInput, bioInput];
    
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.classList.add('focused');
        });

        field.addEventListener('blur', () => {
            if (!field.value) {
                field.parentElement.classList.remove('focused');
            }
        });
    });

    // Password visibility toggles
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    });

    // Auto-focus first field
    nameInput.focus();
}); 