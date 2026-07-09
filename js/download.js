// ===================== DOWNLOAD =====================
function simulateDownload(photo) {
    // Create a temporary link to simulate download
    const link = document.createElement('a');
    link.href = photo.fullImage;
    link.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading "${photo.title}"...`);
}
