import * as model from '../models/annotationModel.js';
import { ObjectId } from 'mongodb';

export async function addAnnotation(req, res) {
  
  try {
   
    const annotation = req.body;
    const createdAnnotation = await model.createAnnotationDocument(annotation);
    res.status(201).json({
      message: 'Annotation created successfully!',
      annotation: createdAnnotation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create annotation' });
  }
}

export async function updateAnnotation(req, res) {
    try {
      const { id } = req.params; 
      const updatedAnnotation = req.body;
  
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
  
      
      const result = await model.updateAnnotation(id, updatedAnnotation);
  
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Annotation not found' });
      }
  
      res.status(200).json({ message: 'Annotation updated successfully!' });
    } catch (error) {
      console.error('Error in updateAnnotation:', error);
      res.status(500).json({ error: 'Failed to update annotation' });
    }
  }


  export async function getAnnotationById(req, res) {
    try {
      const { id } = req.params;
  
     
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
  
      const annotation = await model.getAnnotationById(id);
      
      if (!annotation) {
        return res.status(404).json({ error: 'Annotation not found' });
      }
  
      res.status(200).json(annotation);
    } catch (error) {
      console.error('Error in getAnnotationById:', error);
      res.status(500).json({ error: 'Failed to retrieve annotation' });
    }
  }

  export async function getAllAnnotations(req, res) {
    try {
      const annotations = await model.getAllAnnotations();
      res.status(200).json(annotations);
    } catch (error) {
      console.error('Error in getAllAnnotations:', error);
      res.status(500).json({ error: 'Failed to retrieve annotations' });
    }
  }

  export async function deleteAnnotation(req, res) {
    try {
      const { id } = req.params;
  
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
  
      const result = await model.deleteAnnotation(id);
  
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Annotation not found' });
      }
  
      res.status(200).json({ message: 'Annotation deleted successfully!' });
    } catch (error) {
      console.error('Error in deleteAnnotation:', error);
      res.status(500).json({ error: 'Failed to delete annotation' });
    }
  }

  export async function deleteAllAnnotations(req, res) {
    try {
        
        const annotations = await model.getAllAnnotations();

        if (annotations.length === 0) {
           
            return res.status(200).json({ message: 'No annotations to delete' });
        }

       
        const result = await model.deleteAllAnnotations();

        res.status(200).json({ message: 'All annotations deleted successfully!' });
    } catch (error) {
        console.error('Error in deleteAllAnnotations:', error);
        res.status(500).json({ error: 'Failed to delete annotations' });
    }
}

