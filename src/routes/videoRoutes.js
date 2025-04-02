import express from 'express';
import { uploadAndCreateVideo } from '../controllers/videoController.js';

const router = express.Router();

router.post('/create-video', uploadAndCreateVideo);

export default router;
