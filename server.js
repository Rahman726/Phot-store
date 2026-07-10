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
app.use(express.static(__dirname));

// In-memory user storage (in production, use a database)
let users = [];

// Helper function to generate token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// ===================== AUTH ROUTES =====================

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now(),
            name,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(user);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User created successfully',
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

// ===================== PHOTO UPLOAD =====================

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload — upload a photo (base64 JSON)
app.post('/api/upload', async (req, res) => {
    try {
        const { image, title, artist, category } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        if (!title || !artist) {
            return res.status(400).json({ error: 'Title and artist name are required' });
        }

        // Decode base64 image
        const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ error: 'Invalid image format. Use JPG, PNG, or WebP.' });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `photo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, buffer);

        const photoId = Date.now();
        const url = `/uploads/${filename}`;

        const newPhoto = {
            id: photoId,
            title,
            artist,
            category: category || 'other',
            aspect: 'square',
            image: url,
            fullImage: url,
            createdAt: new Date().toISOString()
        };

        sharedPhotos.unshift(newPhoto);
        savePhotos(sharedPhotos);

        console.log(`Photo uploaded: ${title} by ${artist}`);
        res.status(201).json({ success: true, photo: newPhoto });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// ===================== SHARED PHOTO STORAGE =====================

const PHOTOS_FILE = path.join(__dirname, 'data', 'photos.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load photos from file or start with empty array
function loadPhotos() {
    try {
        if (fs.existsSync(PHOTOS_FILE)) {
            const raw = fs.readFileSync(PHOTOS_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Failed to load photos:', e.message);
    }
    return [];
}

function savePhotos(photos) {
    try {
        fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf-8');
    } catch (e) {
        console.error('Failed to save photos:', e.message);
    }
}

let sharedPhotos = loadPhotos();

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
        savePhotos(sharedPhotos);

        console.log(`New photo saved: ${id}`);
        res.status(201).json({ success: true, photo: newPhoto });
    } catch (error) {
        console.error('Failed to save photo:', error);
        res.status(500).json({ error: 'Failed to save photo' });
    }
});

// ===================== TAGS =====================

let photoTags = {}; // { photoId: [tag1, tag2, ...] }

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
    res.json({ tags: photoTags[req.params.photoId] });
});

// ===================== RATINGS =====================

let photoRatings = {}; // { photoId: [1, 5, 3, ...] }

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

let photoComments = {}; // { photoId: [{user, text, time}, ...] }

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
    res.status(201).json({ comment });
});

// ===================== ALBUMS =====================

let albums = [];

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
    res.json({ album });
});

// DELETE /api/albums/:id/photos/:photoId — remove photo from album
app.delete('/api/albums/:id/photos/:photoId', (req, res) => {
    const album = albums.find(a => a.id == req.params.id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    album.photos = album.photos.filter(p => p != req.params.photoId);
    res.json({ album });
});

// ===================== NOTIFICATIONS =====================

let userNotifications = [];

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
    res.status(201).json({ notification: notif });
});

// GET /api/notifications — get all notifications
app.get('/api/notifications', (req, res) => {
    res.json({ notifications: userNotifications.slice(0, 20) });
});

// ===================== VIEWS (for dashboard) =====================

let photoViews = {};

// POST /api/views/:photoId — increment view count
app.post('/api/views/:photoId', (req, res) => {
    photoViews[req.params.photoId] = (photoViews[req.params.photoId] || 0) + 1;
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

// ===================== START SERVER =====================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Shared photos loaded: ${sharedPhotos.length}`);
});
