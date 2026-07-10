// ===================== VIDEOS =====================

// Free stock video data (Google sample videos + public domain)
const videoData = [
    {
        id: 1,
        title: 'Big Buck Bunny',
        artist: 'Blender Foundation',
        duration: '0:34',
        category: 'animation',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
        id: 2,
        title: 'Elephant Dream',
        artist: 'Blender Foundation',
        duration: '0:30',
        category: 'animation',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    {
        id: 3,
        title: 'For Bigger Blazes',
        artist: 'Google',
        duration: '0:15',
        category: 'nature',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    {
        id: 4,
        title: 'For Bigger Escapes',
        artist: 'Google',
        duration: '0:15',
        category: 'travel',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    },
    {
        id: 5,
        title: 'For Bigger Fun',
        artist: 'Google',
        duration: '0:60',
        category: 'animation',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    },
    {
        id: 6,
        title: 'For Bigger Joyrides',
        artist: 'Google',
        duration: '0:15',
        category: 'travel',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
    },
    {
        id: 7,
        title: 'For Bigger Meltdowns',
        artist: 'Google',
        duration: '0:15',
        category: 'nature',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    },
    {
        id: 8,
        title: 'Sintel Trailer',
        artist: 'Blender Foundation',
        duration: '0:15',
        category: 'animation',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    },
    {
        id: 9,
        title: 'Subaru Outback - Street',
        artist: 'Subaru',
        duration: '0:15',
        category: 'travel',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
    },
    {
        id: 10,
        title: 'Tears of Steel',
        artist: 'Blender Foundation',
        duration: '0:15',
        category: 'animation',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    {
        id: 11,
        title: 'Volkswagen GTI Review',
        artist: 'Google',
        duration: '0:15',
        category: 'technology',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4'
    },
    {
        id: 12,
        title: 'We Are Going On Bullrun',
        artist: 'Google',
        duration: '0:15',
        category: 'travel',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    },
    {
        id: 13,
        title: 'What Care Can You Get For A Grand',
        artist: 'Google',
        duration: '0:15',
        category: 'technology',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    }
];

const videoCategories = ['all', 'animation', 'nature', 'travel', 'technology'];
let currentVideoCategory = 'all';

function initVideos() {
    // Hook up the Videos nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.trim() === 'Videos') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                toggleVideos();
            });
        }
    });

    // Create videos section
    const gallerySection = document.querySelector('.gallery-section');
    if (!gallerySection) return;

    const videosSection = document.createElement('section');
    videosSection.className = 'videos-section';
    videosSection.id = 'videosSection';
    videosSection.style.display = 'none';
    videosSection.innerHTML = `
        <div class="container">
            <div class="videos-header">
                <div class="videos-header-top">
                    <span class="videos-header-icon">🎬</span>
                    <h2>Videos</h2>
                </div>
                <p class="videos-subtitle">Free stock videos for your projects</p>
            </div>
            <div class="videos-filter-bar">
                ${videoCategories.map(cat => `
                    <button class="video-filter-btn ${cat === 'all' ? 'active' : ''}" data-category="${cat}">
                        ${cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div class="videos-grid" id="videosGrid">
                <div class="videos-loading">🎥 Loading videos...</div>
            </div>
        </div>
    `;

    gallerySection.parentElement.insertBefore(videosSection, gallerySection);

    // Video filter bar event listeners
    videosSection.querySelectorAll('.video-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            videosSection.querySelectorAll('.video-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVideoCategory = btn.dataset.category;
            renderVideos();
        });
    });
}

function toggleVideos() {
    const videosSection = document.getElementById('videosSection');
    const gallery = document.querySelector('.gallery-section');
    const hero = document.getElementById('hero');
    const filters = document.querySelector('.filters-section');
    const explore = document.getElementById('exploreSection');
    const dashboard = document.getElementById('dashboardSection');

    if (!videosSection) return;
    const isOpen = videosSection.style.display !== 'none';

    // Close other sections
    if (explore) explore.style.display = 'none';
    if (dashboard) dashboard.style.display = 'none';

    if (isOpen) {
        videosSection.style.display = 'none';
        gallery.style.display = '';
        if (hero) hero.style.display = '';
        if (filters) filters.style.display = '';
    } else {
        videosSection.style.display = 'block';
        gallery.style.display = 'none';
        if (hero) hero.style.display = 'none';
        if (filters) filters.style.display = 'none';
        renderVideos();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    let filtered = videoData;
    if (currentVideoCategory !== 'all') {
        filtered = videoData.filter(v => v.category === currentVideoCategory);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="videos-empty">🎬 No videos in this category yet.</div>';
        return;
    }

    grid.innerHTML = filtered.map(video => `
        <div class="video-card" data-id="${video.id}" data-url="${escapeHtmlAttr(video.videoUrl)}" data-title="${escapeHtmlAttr(video.title)}">
            <div class="video-thumbnail-wrapper">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" class="video-thumbnail">
                <div class="video-play-overlay">
                    <div class="video-play-btn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                </div>
                <span class="video-duration-badge">${video.duration}</span>
            </div>
            <div class="video-info">
                <h4 class="video-title">${escapeHtml(video.title)}</h4>
                <span class="video-artist">${escapeHtml(video.artist)}</span>
                <span class="video-category-tag">${video.category}</span>
            </div>
        </div>
    `).join('');

    // Click to open video player
    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const url = card.dataset.url;
            const title = card.dataset.title;
            openVideoPlayer(url, title);
        });
    });
}

function openVideoPlayer(videoUrl, title) {
    // Remove any existing player
    const existing = document.getElementById('videoPlayerModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'video-player-modal';
    modal.id = 'videoPlayerModal';
    modal.innerHTML = `
        <div class="video-player-overlay" id="videoPlayerOverlay"></div>
        <div class="video-player-content">
            <button class="video-player-close" id="videoPlayerClose">✕</button>
            <div class="video-player-header">
                <h3>${escapeHtml(title || 'Video')}</h3>
            </div>
            <div class="video-player-wrapper">
                <video id="videoPlayer" controls autoplay preload="metadata">
                    <source src="${escapeHtmlAttr(videoUrl)}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.style.display = 'block';
    // Trigger animation
    requestAnimationFrame(() => {
        modal.querySelector('.video-player-overlay').classList.add('open');
        modal.querySelector('.video-player-content').classList.add('open');
    });

    document.body.style.overflow = 'hidden';

    // Cleanup on close (define before event listeners use it)
    const closeVideoPlayer = () => {
        const video = document.getElementById('videoPlayer');
        if (video) video.pause();
        modal.querySelector('.video-player-overlay').classList.remove('open');
        modal.querySelector('.video-player-content').classList.remove('open');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
        document.removeEventListener('keydown', escHandler);
    };

    // Close handlers
    document.getElementById('videoPlayerClose').addEventListener('click', closeVideoPlayer);
    document.getElementById('videoPlayerOverlay').addEventListener('click', closeVideoPlayer);

    // Keyboard escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeVideoPlayer();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeHtmlAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
