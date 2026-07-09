// ===================== AUTO COLOR MATCH =====================

function initColorMatch() {
    // Hook into upload - when an image is selected, analyze its dominant color
    const uploadFileInput = document.getElementById('uploadFileInput');
    const uploadCategory = document.getElementById('uploadCategory');
    
    if (!uploadFileInput) return;
    
    // Override handleFileSelect to add color analysis
    const origHandler = uploadFileInput._origListener || null;
    
    uploadFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            const img = new Image();
            img.onload = function() {
                const dominantColor = getDominantColor(img);
                const suggestedCategory = colorToCategory(dominantColor);
                
                // Auto-select category
                if (uploadCategory && suggestedCategory) {
                    // Check if option exists
                    const options = [...uploadCategory.options].map(o => o.value);
                    if (options.includes(suggestedCategory)) {
                        uploadCategory.value = suggestedCategory;
                    }
                }
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function getDominantColor(img) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

function colorToCategory(color) {
    const { r, g, b } = color;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max > 0 ? (max - min) / max : 0;
    
    // Greens → nature
    if (g > r && g > b && g > 80) return 'nature';
    
    // Blues → travel or abstract
    if (b > r && b > g && b > 80) return r > 100 ? 'travel' : 'abstract';
    
    // Reds/Warm → fashion or food
    if (r > g && r > b && r > 100) {
        if (g > 60) return 'food';
        return 'fashion';
    }
    
    // Low saturation → architecture or portrait
    if (saturation < 0.3) return 'architecture';
    
    // High brightness → abstract
    if ((r + g + b) / 3 > 200) return 'abstract';
    
    // Default
    return 'other';
}
