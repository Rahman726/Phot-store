// ===================== ADMIN DASHBOARD =====================

let adminInitialized = false;

function initAdmin() {
    if (adminInitialized) return;
    adminInitialized = true;

    // Check if current user is admin (first user or has admin flag)
    const isAdmin = checkAdminStatus();

    // Add admin link to nav
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && isAdmin) {
        const adminLink = document.createElement('a');
        adminLink.className = 'nav-link admin-link';
        adminLink.href = '#';
        adminLink.innerHTML = '⚙️ Admin';
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAdminPanel();
        });
        navLinks.appendChild(adminLink);
    }

    // Create admin panel
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.id = 'adminPanel';
    adminPanel.style.display = 'none';
    adminPanel.innerHTML = `
        <div class="container">
            <div class="admin-header">
                <h2>⚙️ Admin Dashboard</h2>
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="users">👥 Users</button>
                    <button class="admin-tab" data-tab="photos">🖼️ Photos</button>
                    <button class="admin-tab" data-tab="analytics">📊 Analytics</button>
                    <button class="admin-tab" data-tab="settings">⚡ Settings</button>
                </div>
                <button class="admin-close-btn" id="adminCloseBtn">← Back to Gallery</button>
            </div>
            <div class="admin-content" id="adminContent">
                <!-- Users Tab -->
                <div class="admin-tab-content active" id="adminUsers">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>👥 Registered Users</h3>
                            <span class="admin-count" id="adminUserCount">0</span>
                        </div>
                        <div class="admin-search-bar">
                            <input type="text" id="adminUserSearch" placeholder="Search users..." />
                        </div>
                        <div class="admin-table-wrapper">
                            <table class="admin-table" id="adminUsersTable">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                        <th>Plan</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="adminUsersBody">
                                    <tr><td colspan="6" class="admin-loading">Loading users...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <!-- Photos Tab -->
                <div class="admin-tab-content" id="adminPhotos">
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>🖼️ Photo Gallery</h3>
                            <span class="admin-count" id="adminPhotoCount">0</span>
                        </div>
                        <div class="admin-photos-grid" id="adminPhotosGrid">
                            ${photos.slice(0, 20).map(p => `
                                <div class="admin-photo-item" data-id="${p.id}">
                                    <img src="${p.image}" alt="${p.title}" loading="lazy">
                                    <div class="admin-photo-overlay">
                                        <span>${p.title}</span>
                                        <button class="admin-photo-delete" data-id="${p.id}">🗑️</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Analytics Tab -->
                <div class="admin-tab-content" id="adminAnalytics">
                    <div class="admin-analytics-grid">
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">👁️</div>
                            <div class="admin-stat-value" id="adminTotalViews">—</div>
                            <div class="admin-stat-label">Total Views</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">⭐</div>
                            <div class="admin-stat-value" id="adminTotalRatings">—</div>
                            <div class="admin-stat-label">Total Ratings</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">💬</div>
                            <div class="admin-stat-value" id="adminTotalComments">—</div>
                            <div class="admin-stat-label">Total Comments</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">📂</div>
                            <div class="admin-stat-value" id="adminTotalAlbums">—</div>
                            <div class="admin-stat-label">Total Albums</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">💎</div>
                            <div class="admin-stat-value" id="adminPremiumUsers">—</div>
                            <div class="admin-stat-label">Premium Users</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-icon">📸</div>
                            <div class="admin-stat-value" id="adminAiGenerations">—</div>
                            <div class="admin-stat-label">AI Generations</div>
                        </div>
                    </div>
                    <div class="admin-card" style="margin-top:20px;">
                        <h3>📊 User Growth</h3>
                        <div class="admin-growth-chart" id="adminGrowthChart">
                            <canvas id="adminChartCanvas" width="800" height="300"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Settings Tab -->
                <div class="admin-tab-content" id="adminSettings">
                    <div class="admin-card">
                        <h3>⚡ Site Settings</h3>
                        <div class="admin-settings-form">
                            <div class="admin-setting">
                                <label>Allow Public Signup</label>
                                <input type="checkbox" id="adminAllowSignup" checked>
                            </div>
                            <div class="admin-setting">
                                <label>Max AI Generations/Day (Free)</label>
                                <input type="number" id="adminMaxFreeGen" value="5" min="1" max="100">
                            </div>
                            <div class="admin-setting">
                                <label>Maintenance Mode</label>
                                <input type="checkbox" id="adminMaintenanceMode">
                            </div>
                            <div class="admin-setting">
                                <label>Site Name</label>
                                <input type="text" id="adminSiteName" value="PhotoStore">
                            </div>
                            <button class="admin-save-btn" id="adminSaveSettings">💾 Save Settings</button>
                        </div>
                    </div>
                    <div class="admin-card" style="margin-top:20px;">
                        <h3>📦 Server Info</h3>
                        <div class="admin-server-info" id="adminServerInfo">
                            <div class="admin-info-row"><span>Node.js</span><span id="adminNodeVersion">Loading...</span></div>
                            <div class="admin-info-row"><span>Uptime</span><span id="adminUptime">Loading...</span></div>
                            <div class="admin-info-row"><span>Memory Usage</span><span id="adminMemory">Loading...</span></div>
                            <div class="admin-info-row"><span>Total Users</span><span id="adminTotalUsers">Loading...</span></div>
                            <div class="admin-info-row"><span>Total Photos</span><span id="adminTotalPhotos">Loading...</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
        gallerySection.parentElement.insertBefore(adminPanel, gallerySection);
    }

    // Event listeners
    document.getElementById('adminCloseBtn')?.addEventListener('click', toggleAdminPanel);
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const content = document.getElementById(`admin${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`);
            if (content) content.classList.add('active');
            
            if (tab.dataset.tab === 'analytics') loadAdminAnalytics();
            if (tab.dataset.tab === 'users') loadAdminUsers();
        });
    });

    // User search
    document.getElementById('adminUserSearch')?.addEventListener('input', (e) => {
        filterAdminUsers(e.target.value);
    });

    // Settings save
    document.getElementById('adminSaveSettings')?.addEventListener('click', saveAdminSettings);

    // Photo delete handlers
    document.querySelectorAll('.admin-photo-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (confirm('Delete this photo permanently?')) {
                await deletePhoto(id);
            }
        });
    });
}

function checkAdminStatus() {
    // First user or anyone with admin flag
    const isAdmin = localStorage.getItem('photoStoreAdmin') === 'true';
    // If user is logged in and is the first user, make them admin
    if (currentUser && !isAdmin) {
        const localUsers = JSON.parse(localStorage.getItem('photoStoreLocalUsers') || '{}');
        const userKeys = Object.keys(localUsers);
        if (userKeys.length > 0 && localUsers[userKeys[0]]?.id === currentUser.id) {
            localStorage.setItem('photoStoreAdmin', 'true');
            return true;
        }
    }
    return isAdmin;
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    const gallery = document.querySelector('.gallery-section');
    const mapSection = document.getElementById('mapSection');
    const explore = document.getElementById('exploreSection');
    const dash = document.getElementById('dashboardSection');
    const hero = document.getElementById('heroMini');
    const filters = document.querySelector('.filters-section');

    if (!panel) return;
    const isOpen = panel.style.display !== 'none';

    if (isOpen) {
        panel.style.display = 'none';
        if (gallery) gallery.style.display = '';
        if (hero) hero.style.display = '';
        if (filters) filters.style.display = '';
    } else {
        panel.style.display = 'block';
        if (gallery) gallery.style.display = 'none';
        if (mapSection) mapSection.style.display = 'none';
        if (explore) explore.style.display = 'none';
        if (dash) dash.style.display = 'none';
        if (hero) hero.style.display = 'none';
        if (filters) filters.style.display = 'none';
        
        // Load data
        loadAdminUsers();
        loadAdminAnalytics();
        updateAdminPhotoCount();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersBody');
    const count = document.getElementById('adminUserCount');
    if (!tbody) return;

    // Get local users
    const localUsers = JSON.parse(localStorage.getItem('photoStoreLocalUsers') || '{}');
    let usersList = Object.values(localUsers);

    // Try server for more users
    try {
        const res = await fetch('/api/admin/users', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const data = await res.json();
            if (data.users) {
                usersList = data.users;
            }
        }
    } catch (e) {
        console.log('Server offline, showing local users');
    }

    if (count) count.textContent = usersList.length;

    if (usersList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="admin-loading">No users found.</td></tr>';
        return;
    }

    tbody.innerHTML = usersList.map(u => {
        const plan = u.plan || 'free';
        const planBadge = plan === 'free' ? '🆓' : plan === 'basic' ? '⭐' : '💎';
        const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown';
        return `
            <tr>
                <td>${u.id || '—'}</td>
                <td><strong>${u.name || 'Unknown'}</strong></td>
                <td>${u.email || '—'}</td>
                <td>${joined}</td>
                <td>${planBadge} ${plan}</td>
                <td class="admin-actions-cell">
                    <button class="admin-action-btn admin-user-promote" data-id="${u.id}" title="Promote">⭐</button>
                    <button class="admin-action-btn admin-user-remove" data-id="${u.id}" title="Remove">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    // Add event listeners for user actions
    tbody.querySelectorAll('.admin-user-promote').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const name = prompt('Enter premium plan (basic/pro):');
            if (name && (name === 'basic' || name === 'pro')) {
                promoteUser(id, name);
            }
        });
    });

    tbody.querySelectorAll('.admin-user-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            if (confirm('Remove this user?')) {
                removeUser(id);
            }
        });
    });
}

function filterAdminUsers(query) {
    const rows = document.querySelectorAll('#adminUsersBody tr');
    const q = query.toLowerCase();
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

function promoteUser(userId, plan) {
    // Try server
    fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
    }).catch(() => {
        // Offline mode
        showToast(`⭐ User promoted to ${plan} (offline mode)`);
    });
    
    showToast(`⭐ User upgraded to ${plan}!`);
    loadAdminUsers();
}

function removeUser(userId) {
    fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
    }).catch(() => {
        showToast('🗑️ User removed (offline mode)');
    });
    
    showToast('🗑️ User removed');
    loadAdminUsers();
}

async function deletePhoto(photoId) {
    // Remove from photos array
    const idx = photos.findIndex(p => p.id === photoId);
    if (idx >= 0) {
        photos.splice(idx, 1);
        renderGallery(photos);
        updateAdminPhotoCount();
        
        // Try server
        fetch(`/api/photos/${photoId}`, { method: 'DELETE' }).catch(() => {});
        
        // Also remove from DOM
        const grid = document.getElementById('adminPhotosGrid');
        const item = grid?.querySelector(`.admin-photo-item[data-id="${photoId}"]`);
        if (item) item.remove();
        
        showToast('🗑️ Photo deleted');
    }
}

function updateAdminPhotoCount() {
    const count = document.getElementById('adminPhotoCount');
    if (count) count.textContent = photos.length;
}

async function loadAdminAnalytics() {
    try {
        const res = await fetch('/api/stats', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('adminTotalViews').textContent = data.totalViews || 0;
            document.getElementById('adminTotalRatings').textContent = data.totalRatings || 0;
            document.getElementById('adminTotalComments').textContent = data.totalComments || 0;
            document.getElementById('adminTotalAlbums').textContent = data.totalAlbums || 0;
        }
    } catch (e) {
        // Use local data
        document.getElementById('adminTotalViews').textContent = photos.length * 10;
        document.getElementById('adminTotalRatings').textContent = '—';
        document.getElementById('adminTotalComments').textContent = '—';
        document.getElementById('adminTotalAlbums').textContent = JSON.parse(localStorage.getItem('photoStoreLocalAlbums') || '[]').length;
    }

    // Premium users count
    const premiumCount = Object.values(JSON.parse(localStorage.getItem('photoStoreLocalUsers') || '{}'))
        .filter(u => u.plan && u.plan !== 'free').length;
    document.getElementById('adminPremiumUsers').textContent = premiumCount || 0;
    document.getElementById('adminAiGenerations').textContent = photos.filter(p => p.category === 'ai').length || 0;

    // Draw growth chart
    drawAdminChart();
}

function drawAdminChart() {
    const canvas = document.getElementById('adminChartCanvas');
    if (!canvas || typeof Chart !== 'undefined') {
        // Simple canvas drawing without Chart.js
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);

        // Simulate growth data
        const days = 14;
        const data = [];
        let val = 5;
        for (let i = 0; i < days; i++) {
            val += Math.floor(Math.random() * 8) + 1;
            data.push(val);
        }

        const max = Math.max(...data);
        const padding = 40;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (graphHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            ctx.fillStyle = '#999';
            ctx.font = '10px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(max * (1 - i / 4)), padding - 5, y + 3);
        }

        // Draw line
        ctx.strokeStyle = '#05a081';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padding + (graphWidth / (days - 1)) * i;
            const y = padding + graphHeight - (val / max) * graphHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw area under line
        ctx.fillStyle = 'rgba(5, 160, 129, 0.1)';
        ctx.lineTo(width - padding, padding + graphHeight);
        ctx.lineTo(padding, padding + graphHeight);
        ctx.closePath();
        ctx.fill();

        // Draw points
        data.forEach((val, i) => {
            const x = padding + (graphWidth / (days - 1)) * i;
            const y = padding + graphHeight - (val / max) * graphHeight;
            ctx.fillStyle = '#05a081';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Day labels
            ctx.fillStyle = '#999';
            ctx.font = '9px Inter';
            ctx.textAlign = 'center';
            if (i % 2 === 0) {
                ctx.fillText(`Day ${i + 1}`, x, height - 10);
            }
        });
    }
}

function saveAdminSettings() {
    const settings = {
        allowSignup: document.getElementById('adminAllowSignup')?.checked ?? true,
        maxFreeGen: document.getElementById('adminMaxFreeGen')?.value ?? 5,
        maintenanceMode: document.getElementById('adminMaintenanceMode')?.checked ?? false,
        siteName: document.getElementById('adminSiteName')?.value || 'PhotoStore'
    };
    
    localStorage.setItem('photoStoreAdminSettings', JSON.stringify(settings));
    showToast('💾 Settings saved!');
    
    // Update site title
    if (settings.siteName) {
        document.title = settings.siteName;
    }
}
