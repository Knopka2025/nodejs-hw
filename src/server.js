import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import pino from 'pino-http';

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());


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

//  GET /notes
app.get('/notes', (req, res) => {

	res.status(200).json({ message: 'Retrieved all notes' });
});

// GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
	const noteId = req.params.noteId;

	res.status(200).json({
		message: `Retrieved note with ID: ${noteId}`,
	});
});

// GET /test-error
app.get('/test-error', (req, res) => {
	throw new Error('Simulated server error');
});

// обробка помилки 404

app.use((req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

// обробка помилокки 500
app.use((err, req, res, next) => {
	res.status(500).json({

		message: err.message || 'Internal Server Error',
	});
});

// старт сервера
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
