// ===================== INIT =====================
// Track online/offline status
window.appOnline = navigator.onLine;

window.addEventListener('online', () => { window.appOnline = true; });
window.addEventListener('offline', () => { window.appOnline = false; });

document.addEventListener('DOMContentLoaded', async () => {
    // Load server photos first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch('/api/photos', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
            const serverPhotos = await res.json();
            if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
                photos.length = 0;
                photos.push(...serverPhotos);
            }
        }
    } catch (e) {
        console.warn('Could not load server photos, using infinite scroll only:', e.message);
    }

    // Initialize all modules — each handles offline gracefully
    if (typeof initFilters === 'function') initFilters();
    if (typeof initSearch === 'function') initSearch();
    if (typeof initTrending === 'function') initTrending();
    if (typeof initFavorites === 'function') initFavorites();
    if (typeof initLightbox === 'function') initLightbox();
    if (typeof initInfiniteScroll === 'function') initInfiniteScroll();
    if (typeof initAuth === 'function') initAuth();
    if (typeof initAlbums === 'function') initAlbums();
    if (typeof initTags === 'function') initTags();
    if (typeof initRatings === 'function') initRatings();
    if (typeof initComments === 'function') initComments();
    if (typeof initNotifications === 'function') initNotifications();
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initExplore === 'function') initExplore();
    if (typeof initBatchDownload === 'function') initBatchDownload();
    if (typeof initPhotoFilters === 'function') initPhotoFilters();
    if (typeof initCollage === 'function') initCollage();
    
    // ===================== PWA INSTALL FEATURE =====================
    if (typeof initPWAInstall === 'function') initPWAInstall();

    // Connect install button
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (typeof promptInstallApp === 'function') promptInstallApp();
        });
    }

    // Also listen for the install button on hero/other places
    document.querySelectorAll('[data-install-app]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof promptInstallApp === 'function') promptInstallApp();
        });
    });

    // Hero buttons
    document.getElementById('heroAiBtn')?.addEventListener('click', () => {
        document.getElementById('aiGenerateBtn')?.click();
    });
    
    // Check for URL actions (from PWA shortcuts)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'ai-generate') {
        setTimeout(() => document.getElementById('aiGenerateBtn')?.click(), 500);
    } else if (action === 'favorites') {
        setTimeout(() => document.getElementById('favToggle')?.click(), 500);
    }
});
