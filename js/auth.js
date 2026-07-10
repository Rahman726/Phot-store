// ===================== DOM =====================
const authOverlay = document.getElementById('authOverlay');
const authModal = document.getElementById('authModal');
const authClose = document.getElementById('authClose');
const authGate = document.getElementById('authGate');
const loginBtn = document.getElementById('loginBtn');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// ===================== AUTH =====================
// Auto-detect API base — works on localhost (node server.js) AND Railway
const API_BASE = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : '/api';
let currentUser = JSON.parse(localStorage.getItem('photoStoreUser') || 'null');
let authToken = localStorage.getItem('photoStoreToken') || '';

function initAuth() {
    // Update login button based on auth state
    updateAuthUI();
    
    // Verify token on load
    if (authToken) {
        verifyToken();
    }
    
    // Open modal on login click
    loginBtn.addEventListener('click', openAuthModal);
    
    // Close modal
    authClose.addEventListener('click', closeAuthModal);
    
    authOverlay.addEventListener('click', closeAuthModal);
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('open')) {
            closeAuthModal();
        }
    });
}

async function verifyToken() {
    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateAuthUI();
            if (typeof updateUploadArtist === 'function') updateUploadArtist();
            hideAuthGate();
        } else {
            // Token invalid, clear it
            logout();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showAuthGate();
    }
}

function showAuthGate() {
    authGate.classList.add('active');
    authModal.classList.add('open');
    authOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function hideAuthGate() {
    authGate.classList.remove('active');
    authModal.classList.remove('open');
    authOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function openAuthModal() {
    if (currentUser) {
        // If logged in, show logout option
        if (confirm('Do you want to logout?')) {
            logout();
        }
    } else {
        authModal.classList.add('open');
        authOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthModal() {
    authModal.classList.remove('open');
    authOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

function switchTab(tabName) {
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('photoStoreUser', JSON.stringify(currentUser));
            localStorage.setItem('photoStoreToken', authToken);

            updateAuthUI();
            if (typeof updateUploadArtist === 'function') updateUploadArtist();
            hideAuthGate();
            showToast('Welcome back! 👋');

            // Reset form
            loginForm.reset();
        } else {
            showToast(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error instanceof TypeError) {
            showToast('⚠️ Server not running! Close this window, run start-app.bat, and try again.');
        } else {
            showToast('⚠️ Server error: ' + error.message);
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('photoStoreUser', JSON.stringify(currentUser));
            localStorage.setItem('photoStoreToken', authToken);

            updateAuthUI();
            if (typeof updateUploadArtist === 'function') updateUploadArtist();
            hideAuthGate();
            showToast('Account created successfully! 🎉');

            // Reset form
            signupForm.reset();
        } else {
            showToast(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (error instanceof TypeError) {
            showToast('⚠️ Server not running! Close this window, run start-app.bat, and try again.');
        } else {
            showToast('⚠️ Server error: ' + error.message);
        }
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    currentUser = null;
    authToken = '';
    localStorage.removeItem('photoStoreUser');
    localStorage.removeItem('photoStoreToken');
    updateAuthUI();
    if (typeof updateUploadArtist === 'function') updateUploadArtist();
    closeAuthModal();
    showToast('Logged out successfully');
}

function updateAuthUI() {
    if (currentUser) {
        loginBtn.textContent = currentUser.name;
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.classList.remove('logged-in');
    }
}

// ===================== GOOGLE SIGN-IN =====================

// Called by Google Identity Services when user signs in
// The Client ID is configured via data-client_id in index.html
window.handleGoogleCredentialResponse = async (response) => {
    try {
        const credential = response.credential;

        const res = await fetch(`${API_BASE}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential })
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('photoStoreUser', JSON.stringify(currentUser));
            localStorage.setItem('photoStoreToken', authToken);

            updateAuthUI();
            if (typeof updateUploadArtist === 'function') updateUploadArtist();
            hideAuthGate();
            showToast('Signed in with Google! 🚀');
        } else {
            showToast(data.error || 'Google sign-in failed');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        showToast('Server error. Please try again.');
    }
};
