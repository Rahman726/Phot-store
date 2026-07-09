// ===================== USER ALBUMS =====================

function initAlbums() {
    // Add albums button to navbar
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    
    const albumsBtn = document.createElement('button');
    albumsBtn.className = 'nav-albums-btn';
    albumsBtn.id = 'albumsBtn';
    albumsBtn.innerHTML = '📂 Albums';
    navActions.insertBefore(albumsBtn, navActions.querySelector('.nav-upload-btn'));
    
    // Create albums modal
    const albumsModal = document.createElement('div');
    albumsModal.className = 'albums-modal';
    albumsModal.id = 'albumsModal';
    albumsModal.innerHTML = `
        <div class="albums-overlay" id="albumsOverlay"></div>
        <div class="albums-panel" id="albumsPanel">
            <div class="albums-header">
                <h3>📂 My Albums</h3>
                <button class="albums-close" id="albumsClose">✕</button>
            </div>
            <div class="albums-body">
                <div class="albums-create">
                    <input type="text" id="albumNameInput" placeholder="New album name..." maxlength="30">
                    <button id="albumCreateBtn">Create</button>
                </div>
                <div class="albums-list" id="albumsList">
                    <p class="albums-empty">No albums yet. Create your first one!</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(albumsModal);
    
    // Event listeners
    albumsBtn.addEventListener('click', openAlbums);
    document.getElementById('albumsClose')?.addEventListener('click', closeAlbums);
    document.getElementById('albumsOverlay')?.addEventListener('click', closeAlbums);
    document.getElementById('albumCreateBtn')?.addEventListener('click', createAlbum);
    document.getElementById('albumNameInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createAlbum();
    });
    
    // Add "Add to Album" button in lightbox
    const lightboxActions = document.querySelector('.lightbox-actions');
    if (lightboxActions) {
        const addToAlbumBtn = document.createElement('button');
        addToAlbumBtn.className = 'lightbox-action-btn';
        addToAlbumBtn.id = 'addToAlbumBtn';
        addToAlbumBtn.innerHTML = '📂 Add to Album';
        addToAlbumBtn.addEventListener('click', showAlbumPicker);
        lightboxActions.appendChild(addToAlbumBtn);
    }
}

function openAlbums() {
    document.getElementById('albumsModal').style.display = 'block';
    document.getElementById('albumsOverlay').classList.add('open');
    document.getElementById('albumsPanel').classList.add('open');
    document.body.style.overflow = 'hidden';
    loadAlbumsList();
}

function closeAlbums() {
    document.getElementById('albumsModal').style.display = 'none';
    document.getElementById('albumsOverlay').classList.remove('open');
    document.getElementById('albumsPanel').classList.remove('open');
    document.body.style.overflow = '';
}

async function createAlbum() {
    const input = document.getElementById('albumNameInput');
    const name = input?.value.trim();
    if (!name) return;
    
    const user = currentUser?.name || 'Anonymous';
    try {
        const res = await fetch('/api/albums', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, user })
        });
        if (res.ok) {
            input.value = '';
            loadAlbumsList();
            showToast(`Album "${name}" created! 🎉`);
        }
    } catch (e) {
        console.warn('Failed to create album:', e);
    }
}

async function loadAlbumsList() {
    const list = document.getElementById('albumsList');
    if (!list) return;
    try {
        const res = await fetch('/api/albums');
        const data = await res.json();
        
        if (data.albums.length === 0) {
            list.innerHTML = '<p class="albums-empty">No albums yet. Create your first one!</p>';
            return;
        }
        
        list.innerHTML = data.albums.map(album => `
            <div class="album-item" data-id="${album.id}">
                <div class="album-icon">📁</div>
                <div class="album-info">
                    <strong>${escapeHtml(album.name)}</strong>
                    <small>${album.photos.length} photos</small>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Failed to load albums:', e);
    }
}

async function showAlbumPicker() {
    const photoId = window.currentLightboxPhotoId;
    if (!photoId || !currentUser) {
        showToast('Login to add photos to albums', 'error');
        return;
    }
    
    try {
        const res = await fetch('/api/albums');
        const data = await res.json();
        
        if (data.albums.length === 0) {
            showToast('Create an album first!', 'error');
            return;
        }
        
        // Simple prompt-based album picker
        const albumNames = data.albums.map((a, i) => `${i + 1}. ${a.name} (${a.photos.length} photos)`).join('\n');
        const choice = prompt(`Select album:\n\n${albumNames}\n\nEnter number (1-${data.albums.length}):`);
        if (!choice) return;
        
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < data.albums.length) {
            const album = data.albums[idx];
            const addRes = await fetch(`/api/albums/${album.id}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoId })
            });
            if (addRes.ok) {
                showToast(`Added to "${album.name}" 📂`);
            }
        }
    } catch (e) {
        console.warn('Failed to show album picker:', e);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
