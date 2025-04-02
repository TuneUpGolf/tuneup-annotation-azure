import express from 'express';
import * as controller from '../controllers/annotationController.js';

const router = express.Router();

router.post('/addannotations', controller.addAnnotation);
router.put('/updateannotation/:id', controller.updateAnnotation);
router.get('/getallAnnotations', controller.getAllAnnotations);
router.get('/getAnnotation/:id', controller.getAnnotationById);
router.delete('/deleteAnnotation/:id', controller.deleteAnnotation);
router.delete('/deleteallAnnotations', controller.deleteAllAnnotations);
export default router;
