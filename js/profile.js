import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const userBioElement = document.getElementById('user-bio');
const userProfileImageElement = document.getElementById('user-profile-image');
const logoutButton = document.getElementById('logout-button');

// Settings form elements
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const bioTextarea = document.getElementById('bio');

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2EwYTBhMCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyIDE2djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+`;

onAuthStateChanged(auth, (user) => {
    if (user) {
        const displayName = user.displayName || 'Anonymous';
        const email = user.email;
        const photoURL = user.photoURL || defaultAvatar;
        
        // This is a placeholder, as Firebase Auth doesn't store a bio by default.
        // This would typically be fetched from a database like Firestore.
        const bio = "I am a web developer"; 

        // Populate profile header
        userNameElement.textContent = displayName;
        userEmailElement.textContent = email;
        userProfileImageElement.src = photoURL;
        userProfileImageElement.alt = displayName;

        // Populate main profile card
        userBioElement.innerHTML = `<strong>Bio:</strong> ${bio}`;

        // Populate settings form
        if (fullNameInput) fullNameInput.value = displayName;
        if (emailInput) emailInput.value = email;
        if (bioTextarea) bioTextarea.value = bio;
        
    } else {
        // This case is handled by auth-guard.js, but as a fallback:
        window.location.href = 'login.html';
    }
});

logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
    }
}); 