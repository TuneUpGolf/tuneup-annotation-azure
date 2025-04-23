import { connectToDb } from '../db/connect.js';
import { ObjectId } from 'mongodb';

export async function updateAnnotation(id, updatedAnnotation) {
    const db = await connectToDb();
    const collection = db.collection('annotations');
  
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedAnnotation }
    );
  }

export async function createAnnotationDocument(annotation) {
  const db = await connectToDb();
  const collection = db.collection('annotations');
  return collection.insertOne(annotation);
}

export async function getAllAnnotations() {
    const db = await connectToDb();
    const collection = db.collection('annotations');
    return await collection.find().toArray();
  }
  
  export async function getAnnotationById(id) {
    const db = await connectToDb();
    const collection = db.collection('annotations');
    
    
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
  
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  export async function deleteAnnotation(id) {
    const db = await connectToDb();
    const collection = db.collection('annotations');
  
   
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }
  
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }

  export async function deleteAllAnnotations() {
    const db = await connectToDb();
    const collection = db.collection('annotations');

    return await collection.deleteMany({});
}






export async function executeAnnotationsOperations() {
  try {
    const annotation = {
      time: 7,
      content: '{"version":"4.5.0","objects":[{"type":"circle","version":"4.5.0","originX":"left","originY":"top","left":100,"top":70,"width":60,"height":60,"fill":"transparent","stroke":"#33FF57","strokeWidth":2,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":2.43,"scaleY":2.43,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"radius":30,"startAngle":0,"endAngle":6.283185307179586}]}' 
    };

    await createAnnotationDocument(annotation);
    console.log('Annotation created successfully!');
  } catch (error) {
    console.error('Failed to create annotation', error);
  }
}


