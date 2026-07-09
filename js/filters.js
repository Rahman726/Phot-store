// ===================== FILTERS =====================
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            applyFilters();
        });
    });
}

function applyFilters() {
    let result = photos;
    if (currentFilter !== 'all') {
        result = result.filter(p => p.category === currentFilter);
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.artist.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }
    renderGallery(result);
}
