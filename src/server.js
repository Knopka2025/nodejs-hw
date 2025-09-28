import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT ?? 3030;

app.use(
    pino({
        level: 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
                hideObject: true,
            },
        },
    }),
);

// ✅ GET /
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Base route is here' });
});

// GET /notes
app.get('/notes', (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: 'Retrieved all notes' });
});

// GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;
    res.status(200).json({ message: `Retrieved note with ID: ${noteId}` });
});

// GET /test-error
app.get('/test-error', (req, res) => {
    throw new Error('Simulated server error');
});

// Middleware 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware 500
app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Simulated server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
