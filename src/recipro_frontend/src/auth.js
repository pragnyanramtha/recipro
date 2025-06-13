import { AuthClient } from "@dfinity/auth-client";
// No need to import HttpAgent explicitly if only AuthClient is used for login/logout

// --- Global State Variables ---
let isAuthenticated = false;
let principal = null;
let authClient = null; // We'll store the authClient instance here for reuse

// --- DOM Elements ---
const authButton = document.getElementById('authButton');
const principalDisplay = document.getElementById('principalDisplay');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const menuIcon = document.getElementById('menuIcon');
const closeIcon = document.getElementById('closeIcon');

// --- Helper for UI Updates ---
function updateAuthUI() {
    if (isAuthenticated) {
        authButton.textContent = 'Logout';
        authButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
        authButton.classList.add('bg-red-500', 'hover:bg-red-700');
        principalDisplay.textContent = principal;
        principalDisplay.classList.remove('hidden'); // Show principal
    } else {
        authButton.textContent = 'Login';
        authButton.classList.remove('bg-red-500', 'hover:bg-red-700');
        authButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        principalDisplay.classList.add('hidden'); // Hide principal
        principalDisplay.textContent = '';
    }
}

// --- Internet Identity Functions ---

async function initializeAuthClient() {
    if (!authClient) {
        authClient = await AuthClient.create();
    }
}

async function checkAuthStatus() {
    await initializeAuthClient();
    if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        principal = identity.getPrincipal().toString();
        isAuthenticated = true;
    } else {
        principal = null;
        isAuthenticated = false;
    }
    updateAuthUI();
}

async function handleLogin() {
    try {
        await initializeAuthClient();
        await authClient.login({
            identityProvider: process.env.DFX_NETWORK === "ic"
                ? "https://identity.ic0.app/#authorize"
                : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}#authorize`,
            onSuccess: async () => {
                console.log("Logged in successfully!");
                await checkAuthStatus(); // Update state and UI after successful login
                window.location.href = "/content.html"; // Redirect to content.html
            },
            onError: (error) => {
                console.error("Login failed:", error);
                alert("Login failed. Please try again.");
            },
            windowOpenerFeatures: `toolbar=0,location=0,menubar=0,width=520,height=600,left=100,top=100`,
        });
    } catch (error) {
        console.error("Error during login process:", error);
        alert("An error occurred during login. Check console for details.");
    }
}

async function handleLogout() {
    try {
        await initializeAuthClient();
        await authClient.logout();
        console.log("Logged out successfully!");
        isAuthenticated = false;
        principal = null;
        updateAuthUI(); // Update UI after logout
        window.location.href = "/"; // Redirect to homepage on logout
    } catch (error) {
        console.error("Error during logout process:", error);
        alert("An error occurred during logout. Check console for details.");
    }
}

// --- Event Listeners ---
authButton.addEventListener('click', () => {
    if (isAuthenticated) {
        handleLogout();
    } else {
        handleLogin();
    }
});

// Mobile menu toggle (assuming a simple toggle for menu icon and 'isMenuOpen' state)
if (mobileMenuToggle) {
    let isMenuOpen = false;
    mobileMenuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            // Add logic here to show/hide the mobile menu content
            console.log("Mobile menu opened");
        } else {
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            // Add logic here to show/hide the mobile menu content
            console.log("Mobile menu closed");
        }
    });
}


// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', checkAuthStatus);