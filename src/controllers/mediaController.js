// controllers/mediaController.js
import * as model from '../models/mediaModel.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function addMedia (req, res) {
  try {
    const { originalname, mimetype, filename, size } = req.file;
    console.log(/req/, req.file);


    const { userId } = req.params;


    const media = {
      originalName: originalname,
      mimeType: mimetype,
      fileName: filename,
      size: size,
      userId: userId,
      uploadDate: new Date(),

    };
    const createdMedia = await model.createMediaDocument(media);
    res.status(201).json({
      message: 'Media uploaded successfully!',
      media: createdMedia
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
}


export async function getAllMedia (req, res) {
  try {
    const media = await model.getAllMedia();
    console.log(/media/, media);

    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve media' });
  }
}

export async function getMediaFiles (req, res) {

  const directoryPath = path.join(__dirname, '../../frontend/uploads/');


  try {

    const files = await fs.promises.readdir(directoryPath);


    const mediaRecords = await model.getAllMedia();


    const fileDetails = files.map(fileName => {
      const media = mediaRecords.find(m => m.fileName === fileName);
      return {
        fileName: fileName,
        originalName: media ? media.originalName : fileName
      };
    });


    res.status(200).json(fileDetails);
  } catch (err) {
    console.error('Error fetching media files:', err);
    res.status(500).send({ message: 'Unable to scan files or retrieve media metadata' });
  }
}
export async function getMediaById (req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    const media = await model.getMediaById(id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve media' });
  }
}

export async function deleteMedia (req, res) {
  try {
    const { id } = req.params;
    console.log('Deleting media with ID:', id);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const media = await model.getMediaById(id);
    console.log('Found media:', media);

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await model.deleteMedia(id);
    console.log('Media deleted successfully:', id);

    res.status(200).json({
      message: 'Media deleted successfully!',
      mediaId: id,
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
}



export async function updateMedia (req, res) {
  try {
    const { id } = req.params;
    const { originalName } = req.body;
    console.log('Updating media with ID:', req.params.id);
    console.log('Updated data body:', req.body);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }


    const media = await model.getMediaById(id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }


    const updatedData = {};
    if (originalName) updatedData.originalName = originalName;


    const updatedMedia = await model.updateMedia(id, updatedData);

    res.status(200).json({
      message: 'Media updated successfully!',
      media: updatedMedia
    });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
}

export async function getMediaByUserId (req, res) {
  try {
    const { userId } = req.params;



    // Fetch media records associated with the userId
    const mediaList = await model.getMediaByUserId(userId, { sort: { uploadDate: -1 } });;

    if (!mediaList || mediaList.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(mediaList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to retrieve media by user ID' });
  }
}
