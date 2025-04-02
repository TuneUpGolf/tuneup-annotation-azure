import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import annotationRoutes from './routes/annotationRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import recordingRoutes from './routes/recordingRoutes.js';
import { connectToDb } from './db/connect.js';
import cors from 'cors'; 
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json()); 

const recordingsFolder = path.join(process.cwd(), 'recordings');

// Enable CORS for frontend (adjust to your public IP if needed)
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || '*',
//   credentials: true
// }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend'), {
  etag: true,          // Enable ETag generation (enabled by default)
  maxAge: '1d'         // Cache files for 1 day (adjust as needed)
}));

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../frontend/uploads')));
app.use('/recordings', express.static(recordingsFolder));

connectToDb();

app.use('/api', annotationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/rec/', recordingRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Serve test file
app.get('/test-file', (req, res) => {
  res.sendFile(path.join(__dirname, '../uploads/test.mp4'));
});

// Set the server to listen on all available interfaces (0.0.0.0)
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running and accessible at http://0.0.0.0:${PORT}`);
});