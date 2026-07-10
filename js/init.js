// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth
    if (typeof initAuth === 'function') initAuth();

    // Initialize videos (nav + dynamic section)
    if (typeof initVideos === 'function') initVideos();

    // Dark mode is auto-initialized by darkmode.js

    // Hero buttons
    document.getElementById('heroAiBtn')?.addEventListener('click', () => {
        document.getElementById('aiGenerateBtn')?.click();
    });
    document.getElementById('heroVideosBtn')?.addEventListener('click', () => {
        document.getElementById('navVideosBtn')?.click();
    });
});
