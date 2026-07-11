// ===================== DOWNLOAD & INSTALL =====================

let downloadInProgress = false;

// Toggle download button loading state
function setDownloadLoading(loading) {
    downloadInProgress = loading;
    document.querySelectorAll('.download-btn, #lightboxDownload, .ai-download-btn').forEach(btn => {
        btn.classList.toggle('loading', loading);
    });
}

// Properly download an image as a file (works on mobile + PC)
async function downloadImage(url, filename) {
    try {
        setDownloadLoading(true);
        showToast('📥 Preparing download...');

        // Fetch the image as a blob
        const response = await fetch(url, {
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || `photo-${Date.now()}.jpg`;
        
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a delay
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            setDownloadLoading(false);
        }, 1000);
        
        showToast('✅ Photo saved to your device!');
        return true;
    } catch (error) {
        setDownloadLoading(false);
        console.error('Download failed:', error);
        // Fallback: open in new tab (user can save manually)
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
            showToast('📱 Long-press the image and select "Save Image"', 'info');
        } else {
            showToast('⚠️ Right-click the image and select "Save image as..."', 'warning');
        }
        window.open(url, '_blank');
        return false;
    }
}

// Enhanced simulateDownload with proper blob download
async function simulateDownload(photo) {
    if (downloadInProgress) return;
    const filename = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    const url = photo.fullImage || photo.image;
    await downloadImage(url, filename);
}

// ===================== PWA INSTALL =====================

let deferredPrompt = null;
let installPromptEvent = null;

// Initialize PWA install support — works on Chrome, Edge, Samsung Internet, etc.
function initPWAInstall() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        ('standalone' in navigator && navigator.standalone)) { // iOS Safari
        hideInstallButton();
    }

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallButton();
        showToast('✅ PhotoStore installed successfully! 🎉');
    });
    
    // Also show install button on iOS devices (they don't support beforeinstallprompt)
    detectIOSInstall();
}

// iOS doesn't support the beforeinstallprompt event, but we can show instructions
function detectIOSInstall() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = 'standalone' in navigator && navigator.standalone;
    
    if (isIOS && !isStandalone) {
        // Show install button with iOS instructions
        showInstallButton();
        document.getElementById('installAppBtn')?.setAttribute('title', 'Tap Share > Add to Home Screen');
        
        // Override prompt for iOS
        window.promptInstallApp = async function() {
            showToast('📱 Tap the Share button in Safari, then "Add to Home Screen"');
        };
    }
}

// Handle PWA display modes for TV, Desktop, Mobile, etc.
// TV (webOS, Tizen) runs the app in the browser typically
// We add shortcuts for TV remote navigation
function setupTVMode() {
    const isTV = /tv|tizen|webOS|SMART-TV|NetCast/i.test(navigator.userAgent);
    if (isTV) {
        document.body.classList.add('tv-mode');
    }
}

function showInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.classList.add('visible');
    }
}

function hideInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
        installBtn.classList.remove('visible');
    }
}

// Trigger the install prompt
async function promptInstallApp() {
    if (!deferredPrompt) {
        // Show manual install instructions based on device
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
            showToast('📱 Tap Share > Add to Home Screen');
        } else if (isMobile) {
            showToast('📱 Open menu (⋮) > Install app or Add to Home screen');
        } else {
            showToast('ℹ️ Look for the install icon in the address bar');
        }
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
        showToast('📲 Installing PhotoStore...');
    } else {
        showToast('Install cancelled');
    }
    
    deferredPrompt = null;
    hideInstallButton();
}

// Auto-detect display mode and setup
setupTVMode();


