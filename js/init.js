// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', async () => {
    // Load AI-generated photos from the server first (real user content at top)
    try {
        const response = await fetch('/api/photos');
        if (response.ok) {
            const serverPhotos = await response.json();
            serverPhotos.forEach(p => photos.push(p));
        }
    } catch (e) {
        console.warn('Failed to load shared photos:', e);
        if (typeof showToast === 'function') {
            showToast('⚠️ Server not connected. Run "start-app.bat" or "node server.js" to enable Login, Signup, AI, and Upload features.');
        }
    }
    
    // Start infinite scroll for unlimited photos (server/AI photos merge at top)
    initInfiniteScroll();
    
    updateFavUI();
    initFilters();
    initHeroSearch();
    initNavSearch();
    initTrendingTags();
    initFavorites();
    initLightbox();
    initAuth();
    
    // Initialize new features
    if (typeof initRatings === 'function') initRatings();
    if (typeof initComments === 'function') initComments();
    if (typeof initShare === 'function') initShare();
    if (typeof initSlideshow === 'function') initSlideshow();
    if (typeof initEditor === 'function') initEditor();
    if (typeof initExplore === 'function') initExplore();
    if (typeof initVideos === 'function') initVideos();
    if (typeof initAlbums === 'function') initAlbums();
    if (typeof initDashboard === 'function') initDashboard();
    if (typeof initTags === 'function') initTags();
    
    // Round 3 features
    if (typeof initI18n === 'function') initI18n();
    if (typeof initThemes === 'function') initThemes();
    if (typeof initMusicPlayer === 'function') initMusicPlayer();
    if (typeof initCollage === 'function') initCollage();
    if (typeof initPhotoFilters === 'function') initPhotoFilters();
    if (typeof initParallax === 'function') initParallax();
    if (typeof initNotifications === 'function') initNotifications();
    if (typeof initProfiles === 'function') initProfiles();
    if (typeof initBatchDownload === 'function') initBatchDownload();
    if (typeof initColorMatch === 'function') initColorMatch();
    if (typeof initHeatmap === 'function') initHeatmap();
});
