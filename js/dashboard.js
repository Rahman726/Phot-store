// ===================== DASHBOARD =====================

function initDashboard() {
    // Add dashboard link to footer or collections nav
    const collectionsLink = document.querySelector('.nav-link[href="#"]');
    if (collectionsLink && collectionsLink.textContent.trim() === 'Collections') {
        const dashLink = collectionsLink.cloneNode(true);
        dashLink.textContent = '📊 Dashboard';
        dashLink.href = '#';
        dashLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleDashboard();
        });
        collectionsLink.parentElement.appendChild(dashLink);
    }
    
    // Create dashboard section
    const gallerySection = document.querySelector('.gallery-section');
    if (!gallerySection) return;
    
    const dashSection = document.createElement('section');
    dashSection.className = 'dashboard-section';
    dashSection.id = 'dashboardSection';
    dashSection.style.display = 'none';
    dashSection.innerHTML = `
        <div class="container">
            <div class="dash-header">
                <h2>📊 Dashboard</h2>
                <p>Your PhotoStore stats at a glance</p>
            </div>
            <div class="dash-grid" id="dashGrid">
                <div class="dash-card">
                    <div class="dash-icon">🖼️</div>
                    <div class="dash-stat" id="dashPhotos">0</div>
                    <div class="dash-label">Total Photos</div>
                </div>
                <div class="dash-card">
                    <div class="dash-icon">👁️</div>
                    <div class="dash-stat" id="dashViews">0</div>
                    <div class="dash-label">Total Views</div>
                </div>
                <div class="dash-card">
                    <div class="dash-icon">⭐</div>
                    <div class="dash-stat" id="dashRatings">0</div>
                    <div class="dash-label">Total Ratings</div>
                </div>
                <div class="dash-card">
                    <div class="dash-icon">💬</div>
                    <div class="dash-stat" id="dashComments">0</div>
                    <div class="dash-label">Comments</div>
                </div>
                <div class="dash-card">
                    <div class="dash-icon">📂</div>
                    <div class="dash-stat" id="dashAlbums">0</div>
                    <div class="dash-label">Albums</div>
                </div>
                <div class="dash-card">
                    <div class="dash-icon">♥</div>
                    <div class="dash-stat" id="dashFavorites">0</div>
                    <div class="dash-label">Your Favorites</div>
                </div>
            </div>
            <div class="dash-recent" id="dashRecent">
                <h3>Recent Activity</h3>
                <div class="dash-activity-list" id="dashActivity">
                    <p class="dash-empty">No activity yet. Start exploring!</p>
                </div>
            </div>
        </div>
    `;
    
    gallerySection.parentElement.insertBefore(dashSection, gallerySection);
}

function toggleDashboard() {
    const dash = document.getElementById('dashboardSection');
    const gallery = document.querySelector('.gallery-section');
    const hero = document.getElementById('hero');
    const filters = document.querySelector('.filters-section');
    
    if (!dash) return;
    const isOpen = dash.style.display !== 'none';
    
    if (isOpen) {
        dash.style.display = 'none';
        gallery.style.display = '';
        if (hero) hero.style.display = '';
        if (filters) filters.style.display = '';
    } else {
        dash.style.display = 'block';
        gallery.style.display = 'none';
        if (hero) hero.style.display = 'none';
        if (filters) filters.style.display = 'none';
        loadDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function loadDashboard() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        
        document.getElementById('dashPhotos').textContent = stats.totalPhotos || 0;
        document.getElementById('dashViews').textContent = stats.totalViews || 0;
        document.getElementById('dashRatings').textContent = stats.totalRatings || 0;
        document.getElementById('dashComments').textContent = stats.totalComments || 0;
        document.getElementById('dashAlbums').textContent = stats.totalAlbums || 0;
        document.getElementById('dashFavorites').textContent = favorites.length || 0;
        
        // Recent activity placeholder
        const activity = document.getElementById('dashActivity');
        if (activity) {
            activity.innerHTML = `
                <div class="activity-item">
                    <span>📸</span>
                    <span>${stats.totalPhotos} photos in gallery</span>
                </div>
                <div class="activity-item">
                    <span>♥</span>
                    <span>${favorites.length} favorites saved</span>
                </div>
                <div class="activity-item">
                    <span>⭐</span>
                    <span>${stats.totalRatings} ratings given</span>
                </div>
            `;
        }
    } catch (e) {
        console.warn('Failed to load dashboard:', e);
    }
}
