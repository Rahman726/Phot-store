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

// ===================== VIDEO ALBUMS STATE =====================
let currentVideoAlbumView = null; // null = show all videos, object = show album

function initVideos() {
    // Hook up the Videos nav link
    const videosBtn = document.getElementById('navVideosBtn');
    if (videosBtn) {
        videosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleVideos();
        });
    }

    // Create video albums modal
    const vidAlbumModal = document.createElement('div');
    vidAlbumModal.className = 'vid-album-modal';
    vidAlbumModal.id = 'vidAlbumModal';
    vidAlbumModal.style.display = 'none';
    vidAlbumModal.innerHTML = `
        <div class="vid-album-overlay" id="vidAlbumOverlay"></div>
        <div class="vid-album-panel" id="vidAlbumPanel">
            <div class="vid-album-header">
                <h3>📂 Video Albums</h3>
                <button class="vid-album-close" id="vidAlbumClose">✕</button>
            </div>
            <div class="vid-album-body">
                <div class="vid-album-create">
                    <input type="text" id="vidAlbumNameInput" placeholder="New video album name..." maxlength="30">
                    <button id="vidAlbumCreateBtn">Create</button>
                </div>
                <div class="vid-album-list" id="vidAlbumList">
                    <p class="vid-album-empty">No video albums yet. Create your first one!</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(vidAlbumModal);

    // Video album event listeners
    document.getElementById('vidAlbumClose')?.addEventListener('click', closeVidAlbums);
    document.getElementById('vidAlbumOverlay')?.addEventListener('click', closeVidAlbums);
    document.getElementById('vidAlbumCreateBtn')?.addEventListener('click', createVidAlbum);
    document.getElementById('vidAlbumNameInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createVidAlbum();
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
                <div class="videos-actions">
                    <button class="vid-album-toggle-btn" id="vidAlbumToggleBtn">📂 Video Albums</button>
                    <button class="vid-back-btn" id="vidBackBtn" style="display:none;">← Back to Videos</button>
                </div>
            </div>
            <div class="videos-filter-bar" id="videosFilterBar">
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

    // Video Albums toggle button and back button
    document.getElementById('vidAlbumToggleBtn')?.addEventListener('click', openVidAlbums);
    document.getElementById('vidBackBtn')?.addEventListener('click', backToVideos);

    // Video filter bar event listeners
    videosSection.querySelectorAll('.video-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            videosSection.querySelectorAll('.video-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVideoCategory = btn.dataset.category;
            currentVideoAlbumView = null;
            document.getElementById('vidBackBtn').style.display = 'none';
            document.getElementById('vidAlbumToggleBtn').style.display = '';
            renderVideos();
        });
    });
}

// ===================== VIDEO ALBUM FUNCTIONS =====================

function openVidAlbums() {
    document.getElementById('vidAlbumModal').style.display = 'block';
    document.getElementById('vidAlbumOverlay').classList.add('open');
    document.getElementById('vidAlbumPanel').classList.add('open');
    document.body.style.overflow = 'hidden';
    loadVidAlbumsList();
}

function closeVidAlbums() {
    document.getElementById('vidAlbumModal').style.display = 'none';
    document.getElementById('vidAlbumOverlay').classList.remove('open');
    document.getElementById('vidAlbumPanel').classList.remove('open');
    document.body.style.overflow = '';
}

async function createVidAlbum() {
    const input = document.getElementById('vidAlbumNameInput');
    const name = input?.value.trim();
    if (!name) return;
    const user = currentUser?.name || 'Anonymous';
    try {
        const res = await fetch('/api/video-albums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, user })
        });
        if (res.ok) {
            input.value = '';
            loadVidAlbumsList();
            if (typeof showToast === 'function') showToast(`Video Album "${name}" created! 🎉`);
        }
    } catch (e) {
        console.warn('Failed to create video album:', e);
    }
}

async function loadVidAlbumsList() {
    const list = document.getElementById('vidAlbumList');
    if (!list) return;
    try {
        const res = await fetch('/api/video-albums');
        const data = await res.json();

        if (data.albums.length === 0) {
            list.innerHTML = '<p class="vid-album-empty">No video albums yet. Create your first one!</p>';
            return;
        }

        list.innerHTML = data.albums.map(album => `
            <div class="vid-album-item" data-id="${album.id}">
                <div class="vid-album-item-icon">📁</div>
                <div class="vid-album-item-info" onclick="viewVidAlbum('${album.id}')">
                    <strong>${escapeHtml(album.name)}</strong>
                    <small>${album.videos.length} videos</small>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Failed to load video albums:', e);
    }
}

async function viewVidAlbum(albumId) {
    closeVidAlbums();
    try {
        const res = await fetch(`/api/video-albums/${albumId}`);
        const data = await res.json();
        if (data.album) {
            currentVideoAlbumView = data.album;
            document.getElementById('vidBackBtn').style.display = '';
            document.getElementById('vidAlbumToggleBtn').style.display = 'none';
            document.getElementById('videosFilterBar').style.display = 'none';
            renderVidAlbumView(data.album);
        }
    } catch (e) {
        console.warn('Failed to load album:', e);
    }
}

function renderVidAlbumView(album) {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    if (!album.videos || album.videos.length === 0) {
        grid.innerHTML = `<div class="videos-empty">📂 "${escapeHtml(album.name)}" is empty. <br>Click a video card to add videos!</div>`;
        return;
    }

    grid.innerHTML = `
        <div class="vid-album-view-header">
            <h3>📁 ${escapeHtml(album.name)}</h3>
            <span>${album.videos.length} videos</span>
        </div>
        ${album.videos.map(v => `
            <div class="video-card" data-url="${escapeHtmlAttr(v.videoUrl)}" data-title="${escapeHtmlAttr(v.title)}">
                <div class="video-thumbnail-wrapper">
                    <img src="${v.thumbnail || ''}" alt="${v.title}" loading="lazy" class="video-thumbnail" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22><rect fill=%22%23333%22 width=%22320%22 height=%22180%22/><text fill=%22%23999%22 x=%22160%22 y=%2290%22 text-anchor=%22middle%22>🎬</text></svg>'">
                    <div class="video-play-overlay">
                        <div class="video-play-btn">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <h4 class="video-title">${escapeHtml(v.title)}</h4>
                    <span class="video-artist">${escapeHtml(v.artist || '')}</span>
                </div>
            </div>
        `).join('')}
    `;

    // Click to play
    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            openVideoPlayer(card.dataset.url, card.dataset.title);
        });
    });
}

function backToVideos() {
    currentVideoAlbumView = null;
    document.getElementById('vidBackBtn').style.display = 'none';
    document.getElementById('vidAlbumToggleBtn').style.display = '';
    document.getElementById('videosFilterBar').style.display = '';
    currentVideoCategory = 'all';
    document.querySelectorAll('.video-filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.video-filter-btn[data-category="all"]')?.classList.add('active');
    renderVideos();
}

// ===================== TOGGLE VIDEOS =====================

function toggleVideos() {
    const videosSection = document.getElementById('videosSection');
    const gallery = document.querySelector('.gallery-section');
    const hero = document.getElementById('hero');
    const filters = document.querySelector('.filters-section');
    const explore = document.getElementById('exploreSection');
    const dashboard = document.getElementById('dashboardSection');

    if (!videosSection) return;
    const isOpen = videosSection.style.display !== 'none';

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
        backToVideos();
        renderVideos();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===================== RENDER VIDEOS =====================

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
        <div class="video-card" data-id="${video.id}" data-url="${escapeHtmlAttr(video.videoUrl)}" data-title="${escapeHtmlAttr(video.title)}" data-artist="${escapeHtmlAttr(video.artist)}" data-thumb="${escapeHtmlAttr(video.thumbnail)}">
            <div class="video-thumbnail-wrapper">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" class="video-thumbnail">
                <div class="video-play-overlay">
                    <div class="video-play-btn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                </div>
                <span class="video-duration-badge">${video.duration}</span>
                <button class="video-add-album-btn" title="Add to Video Album">📂</button>
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
        card.addEventListener('click', (e) => {
            if (e.target.closest('.video-add-album-btn')) return;
            const url = card.dataset.url;
            const title = card.dataset.title;
            openVideoPlayer(url, title);
        });

        // Add to album button
        card.querySelector('.video-add-album-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = card.dataset.id;
            const title = card.dataset.title;
            const artist = card.dataset.artist;
            const thumbnail = card.dataset.thumb;
            const videoUrl = card.dataset.url;
            showAddToVidAlbumPicker(videoId, title, artist, thumbnail, videoUrl);
        });
    });
}

// ===================== ADD VIDEO TO ALBUM =====================

async function showAddToVidAlbumPicker(videoId, title, artist, thumbnail, videoUrl) {
    if (!currentUser) {
        if (typeof showToast === 'function') showToast('Login to save videos to albums', 'error');
        return;
    }
    try {
        const res = await fetch('/api/video-albums');
        const data = await res.json();

        if (data.albums.length === 0) {
            if (typeof showToast === 'function') showToast('Create a video album first!', 'error');
            return;
        }

        const albumNames = data.albums.map((a, i) => `${i + 1}. ${a.name} (${a.videos.length} videos)`).join('\n');
        const choice = prompt(`Add to which Video Album?\n\n${albumNames}\n\nEnter number (1-${data.albums.length}):`);
        if (!choice) return;

        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < data.albums.length) {
            const album = data.albums[idx];
            const addRes = await fetch(`/api/video-albums/${album.id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: String(videoId), title, artist, thumbnail, videoUrl })
            });
            if (addRes.ok) {
                if (typeof showToast === 'function') showToast(`Added to "${album.name}" 📂`);
            }
        }
    } catch (e) {
        console.warn('Failed to add to album:', e);
    }
}

// ===================== VIDEO PLAYER =====================

function openVideoPlayer(videoUrl, title) {
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
    requestAnimationFrame(() => {
        modal.querySelector('.video-player-overlay').classList.add('open');
        modal.querySelector('.video-player-content').classList.add('open');
    });

    document.body.style.overflow = 'hidden';

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

    document.getElementById('videoPlayerClose').addEventListener('click', closeVideoPlayer);
    document.getElementById('videoPlayerOverlay').addEventListener('click', closeVideoPlayer);

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeVideoPlayer();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ===================== UTILITY =====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeHtmlAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
