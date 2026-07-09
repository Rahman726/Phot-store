// ===================== NOTIFICATIONS =====================

function initNotifications() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    
    const notifBtn = document.createElement('button');
    notifBtn.className = 'notif-btn';
    notifBtn.id = 'notifBtn';
    notifBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-count" id="notifCount"></span>
    `;
    navActions.insertBefore(notifBtn, navActions.querySelector('.nav-fav-toggle'));
    
    // Create notif panel
    const panel = document.createElement('div');
    panel.className = 'notif-panel';
    panel.id = 'notifPanel';
    panel.innerHTML = `
        <div class="notif-header">
            <h4>🔔 Notifications</h4>
        </div>
        <div class="notif-list" id="notifList">
            <p class="notif-empty">No notifications yet</p>
        </div>
    `;
    document.querySelector('.navbar .nav-container')?.appendChild(panel);
    
    notifBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notif-panel') && !e.target.closest('.notif-btn')) {
            panel.classList.remove('open');
        }
    });
    
    // Poll for notifications every 30 seconds
    let lastCheck = Date.now();
    setInterval(() => {
        checkNotifications();
    }, 30000);
    
    // Check on page load too
    setTimeout(checkNotifications, 2000);
}

async function checkNotifications() {
    try {
        // Check for new comments on photos the user has interacted with
        const res = await fetch('/api/notifications');
        if (res.ok) {
            const data = await res.json();
            const list = document.getElementById('notifList');
            const count = document.getElementById('notifCount');
            
            if (data.notifications?.length > 0) {
                if (count) {
                    count.textContent = data.notifications.length;
                    count.classList.add('visible');
                }
                if (list) {
                    list.innerHTML = data.notifications.map(n => `
                        <div class="notif-item">
                            <span class="notif-icon">${n.icon || '💬'}</span>
                            <div class="notif-text">
                                <p>${n.message}</p>
                                <small>${n.time}</small>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (e) {
        // Silent fail
    }
}
