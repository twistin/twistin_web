const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3001;

const SECRET_KEY = 'tu_clave_secreta_segura'; // Cambia esto por una clave fuerte
const ADMIN_USER = 'admin';
const ADMIN_PASS = '01040704';

const dbPath = path.join(__dirname, 'db.json');

// --- CORS seguro para Netlify frontend ---
const DEFAULT_ALLOWED_ORIGINS = [
    'https://sdcarr.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

const allowedOrigins = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envAllowedOrigins])];

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        const isWhitelisted =
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:');
        if (isWhitelisted) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para proteger rutas
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Endpoint de login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '2h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Credenciales incorrectas' });
});

// Endpoint de panel admin protegido
app.get('/api/admin', authenticateToken, (req, res) => {
  res.json({
    ok: true,
    message: 'Panel admin activo',
    user: req.user,
    info: 'Aquí puedes devolver la información de administración que quieras mostrar'
  });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Get all events
app.get('/api/events', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading database.');
    }
    res.json(JSON.parse(data));
  });
});

// Get event by id
app.get('/api/events/:id', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database.');
        }
        const events = JSON.parse(data);
        const event = events.find(e => e.id === req.params.id);
        if (!event) {
            return res.status(404).send('Event not found.');
        }
        res.json(event);
    });
});

// Create a new event
app.post('/api/events', authenticateToken, (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database.');
        }
        const events = JSON.parse(data);
        const newEvent = {
            id: Date.now().toString(),
            title: req.body.title,
            description: req.body.description,
            coverImage: req.body.coverImage,
            images: req.body.images || [],
            videos: req.body.videos || [],
            pdfs: req.body.pdfs || [],
            files: req.body.files || []
        };
        events.push(newEvent);
        fs.writeFile(dbPath, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing to database.');
            }
            res.status(201).json(newEvent);
        });
    });
});

// Update an event
app.put('/api/events/:id', authenticateToken, (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database.');
        }
        let events = JSON.parse(data);
        const index = events.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).send('Event not found.');
        }
        events[index] = {
            ...events[index],
            title: req.body.title || events[index].title,
            description: req.body.description || events[index].description,
            coverImage: req.body.coverImage || events[index].coverImage,
            images: req.body.images || events[index].images,
            videos: req.body.videos || events[index].videos,
            pdfs: req.body.pdfs || events[index].pdfs,
            files: req.body.files || events[index].files
        };
        fs.writeFile(dbPath, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing to database.');
            }
            res.json(events[index]);
        });
    });
});

// Delete an event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading database.');
        }
        let events = JSON.parse(data);
        const index = events.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).send('Event not found.');
        }
        events.splice(index, 1);
        fs.writeFile(dbPath, JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing to database.');
            }
            res.status(204).send();
        });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
