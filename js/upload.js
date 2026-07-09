// ===================== UPLOAD PHOTO =====================

const uploadBtn = document.querySelector('.nav-upload-btn');
const uploadOverlay = document.getElementById('uploadOverlay');
const uploadModal = document.getElementById('uploadModal');
const uploadClose = document.getElementById('uploadClose');
const uploadDropzone = document.getElementById('uploadDropzone');
const uploadDropzoneContent = document.getElementById('uploadDropzoneContent');
const uploadFileInput = document.getElementById('uploadFileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadPreviewImg = document.getElementById('uploadPreviewImg');
const uploadRemoveBtn = document.getElementById('uploadRemoveBtn');
const uploadForm = document.getElementById('uploadForm');
const uploadTitle = document.getElementById('uploadTitle');
const uploadArtist = document.getElementById('uploadArtist');
const uploadCategory = document.getElementById('uploadCategory');
const uploadSubmitBtn = document.getElementById('uploadSubmitBtn');

let selectedFile = null;

// Open modal
uploadBtn.addEventListener('click', () => {
    uploadOverlay.classList.add('open');
    uploadModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    resetUpload();
});

// Close modal
function closeUploadModal() {
    uploadOverlay.classList.remove('open');
    uploadModal.classList.remove('open');
    document.body.style.overflow = '';
    resetUpload();
}

uploadClose.addEventListener('click', closeUploadModal);
uploadOverlay.addEventListener('click', closeUploadModal);

// Drag & drop handlers
uploadDropzone.addEventListener('click', () => {
    if (!selectedFile) uploadFileInput.click();
});

uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('dragover');
});

uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('dragover');
});

uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFileSelect(file);
    } else {
        showToast('Please drop a valid image file', 'error');
    }
});

uploadFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
});

function handleFileSelect(file) {
    if (file.size > 100 * 1024 * 1024) {
        showToast('File is too large. Max 100MB allowed.', 'error');
        return;
    }

    selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadPreviewImg.src = e.target.result;
        uploadDropzoneContent.style.display = 'none';
        uploadPreview.style.display = 'block';
        uploadDropzone.classList.add('has-image');
        
        // Auto-fill title from filename
        if (!uploadTitle.value) {
            const name = file.name.replace(/\.[^/.]+$/, '');
            uploadTitle.value = name.replace(/[-_]/g, ' ');
        }
    };
    reader.readAsDataURL(file);
}

uploadRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpload();
});

function resetUpload() {
    selectedFile = null;
    uploadFileInput.value = '';
    uploadPreviewImg.src = '';
    uploadPreview.style.display = 'none';
    uploadDropzoneContent.style.display = 'flex';
    uploadDropzone.classList.remove('has-image', 'dragover');
    uploadTitle.value = '';
    uploadArtist.value = currentUser?.name || '';
    uploadCategory.value = 'nature';
    uploadSubmitBtn.disabled = false;
    uploadSubmitBtn.classList.remove('loading');
}

// Pre-fill artist name if logged in
function updateUploadArtist() {
    if (currentUser?.name && uploadArtist) {
        uploadArtist.value = currentUser.name;
    }
}

// Handle form submit
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = uploadTitle.value.trim();
    const artist = uploadArtist.value.trim();
    const category = uploadCategory.value;
    
    if (!selectedFile) {
        showToast('Please select a photo to upload', 'error');
        return;
    }
    
    if (!title || !artist) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    uploadSubmitBtn.disabled = true;
    uploadSubmitBtn.classList.add('loading');
    
    try {
        // Read file as base64
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
        });
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64,
                title,
                artist,
                category
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Photo uploaded successfully! 🎉', 'success');
            
            // Add to gallery
            const newPhoto = {
                id: data.photo.id,
                title: data.photo.title,
                artist: data.photo.artist,
                category: data.photo.category,
                aspect: data.photo.aspect || 'square',
                image: data.photo.image,
                fullImage: data.photo.fullImage
            };
            
            photos.unshift(newPhoto);
            applyFilters();
            closeUploadModal();
        } else {
            showToast(data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Failed to upload photo. Server error.', 'error');
    } finally {
        uploadSubmitBtn.disabled = false;
        uploadSubmitBtn.classList.remove('loading');
    }
});
