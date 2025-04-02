import mongoose from 'mongoose';

const recordingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: false
    },
    lessonId: {
        type: String,
        required: false
    },
    videoUrl: { 
        type: String,
        required: true
    },
    videoMimeType: {
        type: String, 
        required: true
    },
    title: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Recording = mongoose.model('Recording', recordingSchema);

export default Recording;
