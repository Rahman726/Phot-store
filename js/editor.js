// ===================== PHOTO EDITOR =====================

let editorCanvas, editorCtx, editorImage;
let editorRotation = 0;
let editorBrightness = 100;
let editorContrast = 100;
let editorFilter = 'none';

function initEditor() {
    // Add edit button to upload preview
    const uploadBody = document.querySelector('.upload-body');
    if (!uploadBody) return;
    
    const editorSection = document.createElement('div');
    editorSection.className = 'photo-editor';
    editorSection.id = 'photoEditor';
    editorSection.style.display = 'none';
    editorSection.innerHTML = `
        <div class="editor-toolbar">
            <button class="editor-btn" data-action="rotate-left">↺ Rotate</button>
            <button class="editor-btn" data-action="rotate-right">↻ Rotate</button>
            <button class="editor-btn" data-action="flip-h">⇔ Flip H</button>
            <button class="editor-btn" data-action="flip-v">⇕ Flip V</button>
        </div>
        <div class="editor-sliders">
            <div class="editor-slider-group">
                <label>Brightness</label>
                <input type="range" id="editorBrightness" min="0" max="200" value="100">
            </div>
            <div class="editor-slider-group">
                <label>Contrast</label>
                <input type="range" id="editorContrast" min="0" max="200" value="100">
            </div>
        </div>
        <div class="editor-filters">
            <button class="filter-chip active" data-filter="none">Original</button>
            <button class="filter-chip" data-filter="grayscale">B&W</button>
            <button class="filter-chip" data-filter="sepia">Sepia</button>
            <button class="filter-chip" data-filter="invert">Invert</button>
            <button class="filter-chip" data-filter="warm">Warm</button>
            <button class="filter-chip" data-filter="cool">Cool</button>
        </div>
        <button class="editor-apply-btn" id="editorApplyBtn">Apply Edits ✓</button>
    `;
    
    uploadBody.insertBefore(editorSection, uploadBody.querySelector('.upload-form'));
    
    // Event listeners
    editorSection.querySelectorAll('.editor-btn').forEach(btn => {
        btn.addEventListener('click', () => handleEditorAction(btn.dataset.action));
    });
    
    document.getElementById('editorBrightness')?.addEventListener('input', applyEditorPreview);
    document.getElementById('editorContrast')?.addEventListener('input', applyEditorPreview);
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            editorFilter = chip.dataset.filter;
            applyEditorPreview();
        });
    });
    
    document.getElementById('editorApplyBtn')?.addEventListener('click', applyEditorFinal);
}

function openEditor(imageSrc) {
    const editor = document.getElementById('photoEditor');
    if (!editor) return;
    editor.style.display = 'block';
    
    editorImage = new Image();
    editorImage.onload = () => {
        editorCanvas = document.createElement('canvas');
        editorCanvas.width = editorImage.width;
        editorCanvas.height = editorImage.height;
        editorCtx = editorCanvas.getContext('2d');
        editorCtx.drawImage(editorImage, 0, 0);
        
        editorRotation = 0;
        editorBrightness = 100;
        editorContrast = 100;
        editorFilter = 'none';
        
        document.getElementById('editorBrightness').value = 100;
        document.getElementById('editorContrast').value = 100;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        document.querySelector('.filter-chip[data-filter="none"]')?.classList.add('active');
    };
    editorImage.src = imageSrc;
}

function closeEditor() {
    const editor = document.getElementById('photoEditor');
    if (editor) editor.style.display = 'none';
}

function handleEditorAction(action) {
    if (!editorCtx || !editorImage) return;
    
    const w = editorCanvas.width;
    const h = editorCanvas.height;
    
    switch (action) {
        case 'rotate-left':
            editorRotation = (editorRotation - 90) % 360;
            break;
        case 'rotate-right':
            editorRotation = (editorRotation + 90) % 360;
            break;
        case 'flip-h':
            editorCtx.save();
            editorCtx.clearRect(0, 0, w, h);
            editorCtx.translate(w, 0);
            editorCtx.scale(-1, 1);
            editorCtx.drawImage(editorImage, 0, 0);
            editorCtx.restore();
            editorImage.src = editorCanvas.toDataURL();
            return;
        case 'flip-v':
            editorCtx.save();
            editorCtx.clearRect(0, 0, w, h);
            editorCtx.translate(0, h);
            editorCtx.scale(1, -1);
            editorCtx.drawImage(editorImage, 0, 0);
            editorCtx.restore();
            editorImage.src = editorCanvas.toDataURL();
            return;
    }
    
    // Apply rotation
    const radians = (editorRotation * Math.PI) / 180;
    const newW = Math.abs(Math.cos(radians)) * w + Math.abs(Math.sin(radians)) * h;
    const newH = Math.abs(Math.sin(radians)) * w + Math.abs(Math.cos(radians)) * h;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newW;
    tempCanvas.height = newH;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.translate(newW / 2, newH / 2);
    tempCtx.rotate(radians);
    tempCtx.drawImage(editorImage, -w / 2, -h / 2);
    
    editorCanvas.width = newW;
    editorCanvas.height = newH;
    editorCtx.drawImage(tempCanvas, 0, 0);
    editorImage.src = editorCanvas.toDataURL();
}

function applyEditorPreview() {
    if (!editorCtx || !editorImage) return;
    
    editorBrightness = parseInt(document.getElementById('editorBrightness')?.value || '100');
    editorContrast = parseInt(document.getElementById('editorContrast')?.value || '100');
    
    editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
    editorCtx.drawImage(editorImage, 0, 0);
    
    if (editorFilter !== 'none' || editorBrightness !== 100 || editorContrast !== 100) {
        const imageData = editorCtx.getImageData(0, 0, editorCanvas.width, editorCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            
            // Brightness
            r = r * (editorBrightness / 100);
            g = g * (editorBrightness / 100);
            b = b * (editorBrightness / 100);
            
            // Contrast
            r = ((r / 255 - 0.5) * (editorContrast / 100) + 0.5) * 255;
            g = ((g / 255 - 0.5) * (editorContrast / 100) + 0.5) * 255;
            b = ((b / 255 - 0.5) * (editorContrast / 100) + 0.5) * 255;
            
            // Filter
            switch (editorFilter) {
                case 'grayscale': {
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    r = g = b = gray;
                    break;
                }
                case 'sepia': {
                    const tr = r, tg = g, tb = b;
                    r = tr * 0.393 + tg * 0.769 + tb * 0.189;
                    g = tr * 0.349 + tg * 0.686 + tb * 0.168;
                    b = tr * 0.272 + tg * 0.534 + tb * 0.131;
                    break;
                }
                case 'invert':
                    r = 255 - r; g = 255 - g; b = 255 - b;
                    break;
                case 'warm':
                    r *= 1.2; g *= 0.9; b *= 0.7;
                    break;
                case 'cool':
                    r *= 0.7; g *= 0.9; b *= 1.2;
                    break;
            }
            
            data[i] = Math.min(255, Math.max(0, r));
            data[i+1] = Math.min(255, Math.max(0, g));
            data[i+2] = Math.min(255, Math.max(0, b));
        }
        editorCtx.putImageData(imageData, 0, 0);
    }
}

function applyEditorFinal() {
    const previewImg = document.getElementById('uploadPreviewImg');
    const fileInput = document.getElementById('uploadFileInput');
    
    if (previewImg && editorCanvas) {
        const dataUrl = editorCanvas.toDataURL('image/jpeg', 0.92);
        previewImg.src = dataUrl;
        
        // Convert dataUrl to File
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeType = 'image/jpeg';
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeType });
        
        // Update the preview image and file input
        const dataTransfer = new DataTransfer();
        const newFile = new File([blob], 'edited-photo.jpg', { type: mimeType });
        dataTransfer.items.add(newFile);
        fileInput.files = dataTransfer.files;
        
        // Trigger file select handler with new file
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
    
    closeEditor();
    showToast('Edits applied! ✅');
}
