import express from 'express';
import multer from 'multer';
import { uploadRecording, getRecordingsByUserId, getAllRecordings } from '../controllers/recordingController.js';

const router = express.Router();
const upload = multer({ dest: 'recordings/' });


router.post('/recordings/:userId', upload.single('video'), uploadRecording);


router.get('/recordings/user/:userId', getRecordingsByUserId);

router.get('/recordings/getAll', getAllRecordings);
export default router;
