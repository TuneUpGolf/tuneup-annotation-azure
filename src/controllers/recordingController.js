import Recording from '../models/recordingModel.js';
import fs from 'fs';
import path from 'path';

const uploadFolder = path.join(process.cwd(), 'recordings');

export const uploadRecording = async (req, res) => {
    try {
        // console.log('--- Upload Recording API Called ---');

        const { videoId, lessonId } = req.body;  
        const { userId } = req.params;          
        const videoFile = req.file;           

        console.log('Received Data:', { userId, videoId, lessonId });

        if (!userId || !videoFile) {
            // console.error('❌ Error: Missing userId or video file');
            return res.status(400).json({ error: 'userId and video file are required' });
        }

        console.log('📂 Upload folder path:', uploadFolder);

        // Ensure upload directory exists
        if (!fs.existsSync(uploadFolder)) {
           // console.log('📂 Creating upload folder...');
            fs.mkdirSync(uploadFolder, { recursive: true });
        } else {
            // console.log('✅ Upload folder already exists');
        }

        // Extract original filename with extension
        const originalName = videoFile.originalname;  
        const fileExtension = path.extname(originalName); 

        // console.log('🎥 Original File Name:', originalName);
        // console.log('📝 File Extension:', fileExtension);

        // Store file with the original name and extension
        const finalFileName = `${videoFile.filename}${fileExtension}`;  
        const filePath = path.join(uploadFolder, finalFileName);

        console.log('📁 Final File Path:', filePath);

        // Rename the file to include the correct extension
        fs.renameSync(videoFile.path, filePath);
        // console.log('✅ File renamed successfully');

        // Generate URL using the correctly named file
        const serverUrl = 'https://api.tuneup.golf/';
        const videoUrl = `${serverUrl}/recordings/${finalFileName}`;

        console.log('🌍 Video URL:', videoUrl);

        // Get last recording to determine numbering
        const lastRecording = await Recording.findOne().sort({ createdAt: -1 });

        let title = 'Recording 1'; 
        if (lastRecording) {
            const lastTitleNumber = parseInt(lastRecording.title.split(' ')[1]); 
            title = `Recording ${lastTitleNumber + 1}.webm`; 
        }

        console.log('📌 Recording Title:', title);

        // Save recording details in DB
        const newRecording = new Recording({
            userId,             
            videoId,            
            lessonId,          
            videoUrl,
            title,         
            videoMimeType: videoFile.mimetype,
            originalName,  
            fileName: finalFileName 
        });

        console.log('💾 Saving recording to database...', newRecording);
        await newRecording.save();
        console.log('✅ Recording saved successfully');

        res.status(201).json({ message: 'Recording uploaded successfully', newRecording });
    } catch (error) {
        console.error('❌ Error uploading recording:', error);
        res.status(500).json({ error: 'Error uploading recording' });
    }
};


export const getAllRecordings = async (req, res) => {
    try {
        
        const recordings = await Recording.find();

        if (!recordings.length) {
            return res.status(200).json([]);
        }

        
        const recordingsWithUrls = recordings.map(recording => ({
            _id: recording._id,
            userId: recording.userId,
            videoId: recording.videoId,
            lessonId: recording.lessonId,
            videoUrl: recording.videoUrl,
            videoMimeType: recording.videoMimeType,
            title: recording.title
        }));

        res.status(200).json(recordingsWithUrls);
    } catch (error) {
        console.error('Error fetching all recordings:', error);
        res.status(500).json({ error: 'Error fetching all recordings' });
    }
};
export const getRecordingsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        
        const recordings = await Recording.find({ userId });

       
        if (!recordings.length) {
            return res.status(200).json([]);
        }

       
        res.status(200).json(recordings);
    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ error: 'Error fetching recordings' });
    }
};