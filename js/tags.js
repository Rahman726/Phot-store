// ===================== PHOTO TAGS =====================

// Add tag UI to lightbox bar
function initTags() {
    // Add tags section to lightbox
    const lightboxBar = document.querySelector('.lightbox-bar');
    if (lightboxBar) {
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'lightbox-tags';
        tagsDiv.id = 'lightboxTags';
        tagsDiv.innerHTML = `
            <div class="tags-list" id="tagsList"></div>
            <div class="tags-add" id="tagsAdd">
                <input type="text" id="tagsInput" placeholder="Add tag..." maxlength="20">
                <button id="tagsSubmitBtn">+</button>
            </div>
        `;
        lightboxBar.parentElement.insertBefore(tagsDiv, lightboxBar.nextSibling);
    }

    // Add tags to photo overlay
    const origRender = window.renderGallery;
}

async function loadTags(photoId) {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    try {
        const res = await fetch(`/api/tags/${photoId}`);
        const data = await res.json();
        tagsList.innerHTML = data.tags.map(t => `<span class="tag-chip">#${t}</span>`).join('');
    } catch (e) {
        console.warn('Failed to load tags:', e);
    }
}

async function addTag(photoId, tag) {
    if (!tag.trim()) return;
    try {
        const res = await fetch(`/api/tags/${photoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags: [tag.trim().toLowerCase()] })
        });
        if (res.ok) {
            loadTags(photoId);
        }
    } catch (e) {
        console.warn('Failed to add tag:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tagsInput = document.getElementById('tagsInput');
    const tagsSubmit = document.getElementById('tagsSubmitBtn');
    
    if (tagsSubmit && tagsInput) {
        tagsSubmit.addEventListener('click', () => {
            const photoId = window.currentLightboxPhotoId;
            if (photoId) addTag(photoId, tagsInput.value);
            tagsInput.value = '';
        });
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const photoId = window.currentLightboxPhotoId;
                if (photoId) addTag(photoId, tagsInput.value);
                tagsInput.value = '';
            }
        });
    }
});
