// ===================== COMMENTS =====================

function initComments() {
    // Add comments section after lightbox bar
    const lightboxBar = document.querySelector('.lightbox-bar');
    if (!lightboxBar) return;
    
    const commentsSection = document.createElement('div');
    commentsSection.className = 'lightbox-comments';
    commentsSection.id = 'lightboxComments';
    commentsSection.innerHTML = `
        <div class="comments-header">
            <h4>💬 Comments</h4>
        </div>
        <div class="comments-list" id="commentsList"></div>
        <div class="comments-add">
            <input type="text" id="commentInput" placeholder="Write a comment..." maxlength="200">
            <button id="commentSubmitBtn">Post</button>
        </div>
    `;
    
    lightboxBar.parentElement.appendChild(commentsSection);
    
    document.getElementById('commentSubmitBtn')?.addEventListener('click', postComment);
    document.getElementById('commentInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') postComment();
    });
}

async function postComment() {
    const input = document.getElementById('commentInput');
    const text = input?.value.trim();
    if (!text) return;
    
    const photoId = window.currentLightboxPhotoId;
    const username = currentUser?.name || 'Anonymous';
    if (!photoId) return;
    
    try {
        const res = await fetch(`/api/comments/${photoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: username, text })
        });
        if (res.ok) {
            input.value = '';
            loadComments(photoId);
        }
    } catch (e) {
        console.warn('Comment failed:', e);
    }
}

async function loadComments(photoId) {
    const list = document.getElementById('commentsList');
    if (!list) return;
    try {
        const res = await fetch(`/api/comments/${photoId}`);
        const data = await res.json();
        if (data.comments.length === 0) {
            list.innerHTML = '<p class="comments-empty">No comments yet. Be the first!</p>';
            return;
        }
        list.innerHTML = data.comments.map(c => `
            <div class="comment-item">
                <div class="comment-avatar">${c.user.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}</div>
                <div class="comment-body">
                    <strong>${c.user}</strong>
                    <p>${escapeHtml(c.text)}</p>
                    <small>${timeAgo(c.time)}</small>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Failed to load comments:', e);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
