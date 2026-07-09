// ===================== RATING SYSTEM =====================

function initRatings() {
    const lightboxBar = document.querySelector('.lightbox-bar');
    if (!lightboxBar) return;
    
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'lightbox-rating';
    ratingDiv.id = 'lightboxRating';
    ratingDiv.innerHTML = `
        <div class="rating-stars" id="ratingStars">
            ${[1,2,3,4,5].map(i => `
                <svg class="star" data-rating="${i}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            `).join('')}
        </div>
        <span class="rating-average" id="ratingAverage"></span>
    `;
    
    // Add before lightbox-actions
    lightboxBar.insertBefore(ratingDiv, lightboxBar.querySelector('.lightbox-actions'));
    
    // Star hover and click
    document.querySelectorAll('#ratingStars .star').forEach(star => {
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', () => {
            const avg = parseFloat(document.getElementById('ratingAverage')?.dataset.avg || '0');
            highlightStars(Math.round(avg));
        });
        
        star.addEventListener('click', async () => {
            const rating = parseInt(star.dataset.rating);
            const photoId = window.currentLightboxPhotoId;
            if (!photoId) return;
            try {
                const res = await fetch(`/api/ratings/${photoId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating })
                });
                if (res.ok) {
                    const data = await res.json();
                    loadRating(photoId);
                    showToast(`You rated this ${rating}/5 ⭐`);
                }
            } catch (e) {
                console.warn('Rating failed:', e);
            }
        });
    });
}

function highlightStars(count) {
    document.querySelectorAll('#ratingStars .star').forEach((s, i) => {
        s.setAttribute('fill', i < count ? 'currentColor' : 'none');
        s.style.color = i < count ? '#f1c40f' : '';
    });
}

async function loadRating(photoId) {
    try {
        const res = await fetch(`/api/ratings/${photoId}`);
        const data = await res.json();
        const avgEl = document.getElementById('ratingAverage');
        if (avgEl) {
            if (data.count > 0) {
                avgEl.textContent = `${data.average} (${data.count} votes)`;
                avgEl.dataset.avg = data.average;
                highlightStars(Math.round(data.average));
            } else {
                avgEl.textContent = 'No ratings yet';
                avgEl.dataset.avg = '0';
            }
        }
    } catch (e) {
        console.warn('Failed to load rating:', e);
    }
}
