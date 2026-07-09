// ===================== AI IMAGE GENERATION =====================

const aiOverlay = document.getElementById('aiOverlay');
const aiModal = document.getElementById('aiModal');
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiClose = document.getElementById('aiClose');
const aiForm = document.getElementById('aiForm');
const aiPrompt = document.getElementById('aiPrompt');
const aiStyle = document.getElementById('aiStyle');
const aiAspect = document.getElementById('aiAspect');
const aiSubmitBtn = document.getElementById('aiSubmitBtn');
const aiResult = document.getElementById('aiResult');
const aiGeneratedImage = document.getElementById('aiGeneratedImage');
const aiResultLoader = document.getElementById('aiResultLoader');
const aiDownloadBtn = document.getElementById('aiDownloadBtn');
const aiAddGalleryBtn = document.getElementById('aiAddGalleryBtn');
const aiRegenerateBtn = document.getElementById('aiRegenerateBtn');
const aiCharCount = document.getElementById('aiCharCount');
const aiSuggestions = document.getElementById('aiSuggestions');
const suggestionChips = document.querySelectorAll('.ai-chip');

let currentGeneratedImageUrl = null;
let lastPrompt = '';
let lastStyle = 'vivid';
let lastAspect = '1024x1024';

// Character count
aiPrompt.addEventListener('input', () => {
    const count = aiPrompt.value.length;
    aiCharCount.textContent = count;
    aiCharCount.parentElement.style.color = count > 450 ? '#e74c3c' : count > 400 ? '#f39c12' : 'var(--text-light)';
});

// Suggestion chips
suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        aiPrompt.value = chip.dataset.prompt;
        aiPrompt.dispatchEvent(new Event('input'));
        aiPrompt.focus();
    });
});

// Open AI Modal
aiGenerateBtn.addEventListener('click', () => {
    aiOverlay.style.display = 'block';
    aiModal.style.display = 'block';
    aiModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => aiPrompt.focus(), 300);
});

// Close AI Modal
function closeAIModal() {
    aiOverlay.style.display = 'none';
    aiModal.style.display = 'none';
    aiModal.classList.remove('open');
    document.body.style.overflow = '';
    aiResult.style.display = 'none';
    aiForm.style.display = 'flex';
    aiSuggestions.style.display = '';
}

aiClose.addEventListener('click', closeAIModal);
aiOverlay.addEventListener('click', closeAIModal);

// Handle AI Image Generation
aiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prompt = aiPrompt.value.trim();
    const style = aiStyle.value;
    const aspect = aiAspect.value;
    
    if (!prompt) {
        showToast('Please enter a prompt', 'error');
        return;
    }
    
    lastPrompt = prompt;
    lastStyle = style;
    lastAspect = aspect;
    
    // Show loading state
    aiSubmitBtn.disabled = true;
    aiSubmitBtn.classList.add('loading');
    aiResult.style.display = 'none';
    
    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, style, aspect })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentGeneratedImageUrl = data.imageUrl;
            aiGeneratedImage.src = data.imageUrl;
            aiResult.style.display = 'block';
            aiForm.style.display = 'none';
            aiSuggestions.style.display = 'none';
            
            // Show loader until image loads
            if (aiResultLoader) aiResultLoader.style.display = 'flex';
            
            showToast('✨ Image generated successfully!', 'success');
        } else {
            showToast(data.error || 'Failed to generate image', 'error');
        }
    } catch (error) {
        console.error('AI Generation Error:', error);
        showToast('Failed to generate image. Please try again.', 'error');
    } finally {
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.classList.remove('loading');
    }
});

// Hide loader when image loads
aiGeneratedImage.addEventListener('load', () => {
    if (aiResultLoader) aiResultLoader.style.display = 'none';
});

aiGeneratedImage.addEventListener('error', () => {
    if (aiResultLoader) {
        aiResultLoader.innerHTML = '<span>Failed to load image</span>';
        aiResultLoader.style.display = 'flex';
    }
});

// Download Generated Image
aiDownloadBtn.addEventListener('click', async () => {
    if (!currentGeneratedImageUrl) return;
    
    try {
        const response = await fetch(currentGeneratedImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-generated-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Image downloaded!', 'success');
    } catch (error) {
        console.error('Download Error:', error);
        showToast('Failed to download image', 'error');
    }
});

// Add to Gallery
aiAddGalleryBtn.addEventListener('click', () => {
    if (!currentGeneratedImageUrl) return;
    
    const newPhoto = {
        id: Date.now(),
        title: 'AI Generated Image',
        artist: currentUser ? currentUser.name : 'AI Assistant',
        category: 'ai',
        aspect: lastAspect === '1024x768' || lastAspect === '1280x720' ? 'landscape' : 
                lastAspect === '768x1024' || lastAspect === '720x1280' ? 'portrait' : 'square',
        image: currentGeneratedImageUrl,
        fullImage: currentGeneratedImageUrl
    };
    
    photos.unshift(newPhoto);
    
    // Share with all users
    fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto)
    }).catch(e => console.warn('Failed to share photo:', e));
    
    applyFilters();
    showToast('Image shared with everyone! 🎉', 'success');
    closeAIModal();
});

// Regenerate button
aiRegenerateBtn.addEventListener('click', () => {
    if (!lastPrompt) return;
    aiForm.style.display = 'flex';
    aiResult.style.display = 'none';
    aiPrompt.value = lastPrompt;
    aiStyle.value = lastStyle;
    aiAspect.value = lastAspect;
    aiSuggestions.style.display = '';
    aiForm.dispatchEvent(new Event('submit'));
});

// "Create New" — back to form without regenerating
const aiCreateNewBtn = document.createElement('button');
aiCreateNewBtn.className = 'ai-create-new-btn';
aiCreateNewBtn.innerHTML = '← Create New';
aiCreateNewBtn.addEventListener('click', () => {
    aiForm.style.display = 'flex';
    aiResult.style.display = 'none';
    aiPrompt.value = '';
    aiStyle.value = 'vivid';
    aiAspect.value = '1024x1024';
    aiSuggestions.style.display = '';
    aiPrompt.dispatchEvent(new Event('input'));
});
document.querySelector('.ai-result-actions')?.appendChild(aiCreateNewBtn);
