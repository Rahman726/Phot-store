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
const aiDownloadBtn = document.getElementById('aiDownloadBtn');
const aiCreateNewBtn = document.getElementById('aiCreateNewBtn');
const aiCharCount = document.getElementById('aiCharCount');
const aiSuggestions = document.getElementById('aiSuggestions');
const suggestionChips = document.querySelectorAll('.ai-chip');

let currentGeneratedImageUrl = null;
let lastPrompt = '';
let lastStyle = 'vivid';
let lastAspect = '1024x1024';

// Character count
if (aiPrompt) {
    aiPrompt.addEventListener('input', () => {
        const count = aiPrompt.value.length;
        aiCharCount.textContent = count;
    });
}

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

    aiSubmitBtn.disabled = true;
    aiSubmitBtn.classList.add('loading');
    aiResult.style.display = 'none';

    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, style, aspect })
        });

        const data = await response.json();

        if (data.success) {
            currentGeneratedImageUrl = data.imageUrl;
            aiGeneratedImage.src = data.imageUrl;
            aiResult.style.display = 'block';
            aiForm.style.display = 'none';
            aiSuggestions.style.display = 'none';
            showToast('✨ Image generated!', 'success');
        } else {
            showToast(data.error || 'Failed to generate image', 'error');
        }
    } catch (error) {
        console.error('AI Error:', error);
        showToast('Failed to generate image. Try again.', 'error');
    } finally {
        aiSubmitBtn.disabled = false;
        aiSubmitBtn.classList.remove('loading');
    }
});

// Download
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
        showToast('Failed to download image', 'error');
    }
});

// Create New — back to form
aiCreateNewBtn.addEventListener('click', () => {
    aiForm.style.display = 'flex';
    aiResult.style.display = 'none';
    aiPrompt.value = '';
    aiStyle.value = 'vivid';
    aiAspect.value = '1024x1024';
    aiSuggestions.style.display = '';
    aiPrompt.dispatchEvent(new Event('input'));
});
