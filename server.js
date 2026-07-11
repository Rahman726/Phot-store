const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-1209e7c31f9143c8b713206a823188dc';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));

// PWA headers for service worker, cache control, and offline support
app.use((req, res, next) => {
    // Service worker must be served without cache
    if (req.url === '/sw.js' || req.url === '/manifest.json') {
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
});

app.use(express.static(__dirname, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
        // Cache JS and CSS for 24 hours
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
        // Cache images for 7 days
        if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp|avif)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
        // HTML and JSON: no cache
        if (filePath.endsWith('.json') || filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// ===================== SHARED PHOTO STORAGE =====================

const DATA_DIR = path.join(__dirname, 'data');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');
const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const VIEWS_FILE = path.join(DATA_DIR, 'views.json');
const VIDEO_ALBUMS_FILE = path.join(DATA_DIR, 'video-albums.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generic JSON file loader/saver
function loadJSON(filePath, defaultValue) {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error(`Failed to load ${path.basename(filePath)}:`, e.message);
    }
    return defaultValue;
}

function saveJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error(`Failed to save ${path.basename(filePath)}:`, e.message);
    }
}

// Debounced save to avoid excessive disk writes
const _saveTimers = {};
function debouncedSave(filePath, data, delay = 1000) {
    if (_saveTimers[filePath]) clearTimeout(_saveTimers[filePath]);
    _saveTimers[filePath] = setTimeout(() => saveJSON(filePath, data), delay);
}

// Load all persistent data
let sharedPhotos = loadJSON(PHOTOS_FILE, []);
let users = loadJSON(USERS_FILE, []);
let photoTags = loadJSON(TAGS_FILE, {});
let photoRatings = loadJSON(RATINGS_FILE, {});
let photoComments = loadJSON(COMMENTS_FILE, {});
let albums = loadJSON(ALBUMS_FILE, []);
let userNotifications = loadJSON(NOTIFICATIONS_FILE, []);
let photoViews = loadJSON(VIEWS_FILE, {});
let videoAlbums = loadJSON(VIDEO_ALBUMS_FILE, []);

console.log(`Loaded data: ${users.length} users, ${sharedPhotos.length} photos, ${albums.length} albums`);

// Helper function to generate token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ===================== AUTH ROUTES =====================

// Signup (only name needed — auto-generates email & password)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Auto-generate unique email and password
        const randomId = Date.now() + Math.random().toString(36).slice(2, 6);
        const email = `user-${randomId}@photostore.app`;
        const generatedPassword = Math.random().toString(36).slice(2, 12);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Create user
        const user = {
            id: Date.now(),
            name: name.trim(),
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        saveJSON(USERS_FILE, users);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'Welcome!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Google Sign-In
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential is required' });
        }

        // Verify the Google ID token
        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name || email.split('@')[0];

        // Check if user already exists by googleId or email
        let user = users.find(u => u.googleId === googleId || u.email === email);

        if (user) {
            // Update googleId if user exists but didn't have one linked
            if (!user.googleId) {
                user.googleId = googleId;
            }
        } else {
            // Create new user from Google profile
            user = {
                id: Date.now(),
                name,
                email,
                googleId,
                password: '', // No password for Google-authenticated users
                avatar: payload.picture || '',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            saveJSON(USERS_FILE, users);
        }

        // Generate JWT (same as regular auth)
        const token = generateToken(user);

        res.json({
            message: 'Google sign-in successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || ''
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid Google credential' });
    }
});

// Logout (client-side token removal, but we can track it if needed)
app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

// Verify token
app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ===================== USER ROUTES =====================

// Get user profile
app.get('/api/user/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ===================== AI IMAGE GENERATION ROUTES =====================

// Generate AI Image
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { prompt, style, aspect } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Parse aspect ratio
        let width = 1024, height = 1024;
        if (aspect) {
            const parts = aspect.split('x');
            if (parts.length === 2) {
                width = parseInt(parts[0]) || 1024;
                height = parseInt(parts[1]) || 1024;
            }
        }

        console.log(`Generating image: "${prompt.substring(0, 50)}..." (${width}x${height}, ${style || 'vivid'})`);

        // Build Pollinations.ai image URL (free, no API key needed)
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 999999);
        const model = style === 'anime' ? 'flux' : style === 'sketch' ? 'flux' : 'flux';
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&enhance=true`;

        console.log('Image URL generated');

        res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt
        });
    } catch (error) {
        console.error('AI Image Generation Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate image',
            details: error.message 
        });
    }
});

// ===================== AI CHAT PROXY =====================

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        console.log('Chat request received, messages:', messages.length);

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API error:', response.status, errorText);
            return res.status(response.status).json({ error: 'AI service error', details: errorText });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, no response generated.';

        console.log('Chat reply generated, length:', reply.length);
        res.json({ reply });
    } catch (error) {
        console.error('Chat proxy error:', error);
        res.status(500).json({ error: 'Chat service unavailable' });
    }
});

// ===================== SHARED PHOTO STORAGE =====================

// GET /api/photos — return all shared photos
app.get('/api/photos', (req, res) => {
    res.json(sharedPhotos);
});

// POST /api/photos — add a new photo (shared to all users)
app.post('/api/photos', (req, res) => {
    try {
        const { id, title, artist, category, aspect, image, fullImage } = req.body;

        if (!id || !image) {
            return res.status(400).json({ error: 'Photo id and image are required' });
        }

        const newPhoto = {
            id,
            title: title || 'AI Generated Image',
            artist: artist || 'AI Assistant',
            category: category || 'ai',
            aspect: aspect || 'square',
            image,
            fullImage: fullImage || image,
            createdAt: new Date().toISOString()
        };

        sharedPhotos.unshift(newPhoto);
        saveJSON(PHOTOS_FILE, sharedPhotos);

        console.log(`New photo saved: ${id}`);
        res.status(201).json({ success: true, photo: newPhoto });
    } catch (error) {
        console.error('Failed to save photo:', error);
        res.status(500).json({ error: 'Failed to save photo' });
    }
});

// ===================== TAGS =====================

// Tags are now loaded from persistent JSON storage above

// GET /api/tags/:photoId — get tags for a photo
app.get('/api/tags/:photoId', (req, res) => {
    const tags = photoTags[req.params.photoId] || [];
    res.json({ tags });
});

// POST /api/tags/:photoId — add tags to a photo
app.post('/api/tags/:photoId', (req, res) => {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags array is required' });
    }
    photoTags[req.params.photoId] = [...new Set([...(photoTags[req.params.photoId] || []), ...tags])];
    debouncedSave(TAGS_FILE, photoTags);
    res.json({ tags: photoTags[req.params.photoId] });
});

// ===================== RATINGS =====================

// Ratings are now loaded from persistent JSON storage above

// POST /api/ratings/:photoId — rate a photo
app.post('/api/ratings/:photoId', (req, res) => {
    const { rating } = req.body;
    const score = parseInt(rating);
    if (score < 1 || score > 5) {
        return res.status(400).json({ error: 'Rating must be 1-5' });
    }
    if (!photoRatings[req.params.photoId]) {
        photoRatings[req.params.photoId] = [];
    }
    photoRatings[req.params.photoId].push(score);
    debouncedSave(RATINGS_FILE, photoRatings);
    const ratings = photoRatings[req.params.photoId];
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    res.json({ average: Math.round(avg * 10) / 10, count: ratings.length });
});

// GET /api/ratings/:photoId — get average rating
app.get('/api/ratings/:photoId', (req, res) => {
    const ratings = photoRatings[req.params.photoId] || [];
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    res.json({ average: Math.round(avg * 10) / 10, count: ratings.length });
});

// ===================== COMMENTS =====================

// Comments are now loaded from persistent JSON storage above

// GET /api/comments/:photoId — get comments for a photo
app.get('/api/comments/:photoId', (req, res) => {
    res.json({ comments: photoComments[req.params.photoId] || [] });
});

// POST /api/comments/:photoId — add a comment
app.post('/api/comments/:photoId', (req, res) => {
    const { user, text } = req.body;
    if (!user || !text) {
        return res.status(400).json({ error: 'User and text are required' });
    }
    if (!photoComments[req.params.photoId]) {
        photoComments[req.params.photoId] = [];
    }
    const comment = {
        id: Date.now(),
        user,
        text,
        time: new Date().toISOString()
    };
    photoComments[req.params.photoId].unshift(comment);
    debouncedSave(COMMENTS_FILE, photoComments);
    res.status(201).json({ comment });
});

// ===================== ALBUMS =====================

// Albums are now loaded from persistent JSON storage above

// POST /api/albums — create an album
app.post('/api/albums', (req, res) => {
    const { name, user } = req.body;
    if (!name || !user) {
        return res.status(400).json({ error: 'Name and user are required' });
    }
    const album = {
        id: Date.now(),
        name,
        user,
        photos: [],
        createdAt: new Date().toISOString()
    };
    albums.push(album);
    debouncedSave(ALBUMS_FILE, albums);
    res.status(201).json({ album });
});

// GET /api/albums — list all albums
app.get('/api/albums', (req, res) => {
    res.json({ albums });
});

// GET /api/albums/:id — get a single album
app.get('/api/albums/:id', (req, res) => {
    const album = albums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    res.json({ album });
});

// POST /api/albums/:id/photos — add photo to album
app.post('/api/albums/:id/photos', (req, res) => {
    const album = albums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    const { photoId } = req.body;
    if (!album.photos.includes(photoId)) {
        album.photos.push(photoId);
    }
    debouncedSave(ALBUMS_FILE, albums);
    res.json({ album });
});

// DELETE /api/albums/:id/photos/:photoId — remove photo from album
app.delete('/api/albums/:id/photos/:photoId', (req, res) => {
    const album = albums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    album.photos = album.photos.filter(p => p != req.params.photoId);
    debouncedSave(ALBUMS_FILE, albums);
    res.json({ album });
});

// ===================== NOTIFICATIONS =====================

// Notifications are now loaded from persistent JSON storage above

// POST /api/notifications — add a notification
app.post('/api/notifications', (req, res) => {
    const { message, icon, userId } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const notif = {
        id: Date.now(),
        message,
        icon: icon || '💬',
        time: new Date().toLocaleString(),
        userId: userId || 'all'
    };
    userNotifications.unshift(notif);
    if (userNotifications.length > 50) userNotifications.length = 50;
    debouncedSave(NOTIFICATIONS_FILE, userNotifications);
    res.status(201).json({ notification: notif });
});

// GET /api/notifications — get all notifications
app.get('/api/notifications', (req, res) => {
    res.json({ notifications: userNotifications.slice(0, 20) });
});

// ===================== VIEWS (for dashboard) =====================

// Views are now loaded from persistent JSON storage above

// POST /api/views/:photoId — increment view count
app.post('/api/views/:photoId', (req, res) => {
    photoViews[req.params.photoId] = (photoViews[req.params.photoId] || 0) + 1;
    debouncedSave(VIEWS_FILE, photoViews);
    res.json({ views: photoViews[req.params.photoId] });
});

// GET /api/views/:photoId — get view count
app.get('/api/views/:photoId', (req, res) => {
    res.json({ views: photoViews[req.params.photoId] || 0 });
});

// GET /api/stats — get overall stats for dashboard
app.get('/api/stats', (req, res) => {
    const totalPhotos = sharedPhotos.length;
    const totalViews = Object.values(photoViews).reduce((a, b) => a + b, 0);
    const totalRatings = Object.values(photoRatings).reduce((a, b) => a + b.length, 0);
    const totalComments = Object.values(photoComments).reduce((a, b) => a + b.length, 0);
    const totalAlbums = albums.length;
    res.json({
        totalPhotos,
        totalViews,
        totalRatings,
        totalComments,
        totalAlbums
    });
});

// ===================== VIDEO ALBUMS =====================

// Video Albums are now loaded from persistent JSON storage above

// POST /api/video-albums — create a video album
app.post('/api/video-albums', (req, res) => {
    const { name, user } = req.body;
    if (!name || !user) {
        return res.status(400).json({ error: 'Name and user are required' });
    }
    const album = {
        id: Date.now(),
        name,
        user,
        videos: [],
        createdAt: new Date().toISOString()
    };
    videoAlbums.push(album);
    debouncedSave(VIDEO_ALBUMS_FILE, videoAlbums);
    res.status(201).json({ album });
});

// GET /api/video-albums — list all video albums
app.get('/api/video-albums', (req, res) => {
    res.json({ albums: videoAlbums });
});

// GET /api/video-albums/:id — get a single video album
app.get('/api/video-albums/:id', (req, res) => {
    const album = videoAlbums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    res.json({ album });
});

// POST /api/video-albums/:id/videos — add video to album
app.post('/api/video-albums/:id/videos', (req, res) => {
    const album = videoAlbums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    const { videoId, title, artist, thumbnail, videoUrl } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });
    if (!album.videos.find(v => v.videoId == videoId)) {
        album.videos.push({ videoId, title: title || 'Video', artist: artist || 'Unknown', thumbnail: thumbnail || '', videoUrl: videoUrl || '' });
    }
    debouncedSave(VIDEO_ALBUMS_FILE, videoAlbums);
    res.json({ album });
});

// DELETE /api/video-albums/:id/videos/:videoId — remove video from album
app.delete('/api/video-albums/:id/videos/:videoId', (req, res) => {
    const album = videoAlbums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    album.videos = album.videos.filter(v => v.videoId != req.params.videoId);
    debouncedSave(VIDEO_ALBUMS_FILE, videoAlbums);
    res.json({ album });
});

// Graceful shutdown — flush pending debounced saves before exit
function flushPendingSaves() {
    Object.keys(_saveTimers).forEach(filePath => {
        clearTimeout(_saveTimers[filePath]);
        delete _saveTimers[filePath];
    });
    // Force immediate save for all data
    saveJSON(PHOTOS_FILE, sharedPhotos);
    saveJSON(USERS_FILE, users);
    saveJSON(TAGS_FILE, photoTags);
    saveJSON(RATINGS_FILE, photoRatings);
    saveJSON(COMMENTS_FILE, photoComments);
    saveJSON(ALBUMS_FILE, albums);
    saveJSON(NOTIFICATIONS_FILE, userNotifications);
    saveJSON(VIEWS_FILE, photoViews);
    saveJSON(VIDEO_ALBUMS_FILE, videoAlbums);
    console.log('All data flushed to disk.');
}

process.on('SIGTERM', () => {
    console.log('SIGTERM received — flushing data...');
    flushPendingSaves();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received — flushing data...');
    flushPendingSaves();
    process.exit(0);
});

// ===================== EXPORT FOR NETLIFY / LOCAL =====================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Shared photos loaded: ${sharedPhotos.length}`);
    });
}

// ===================== OFFLINE FALLBACK =====================
// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
