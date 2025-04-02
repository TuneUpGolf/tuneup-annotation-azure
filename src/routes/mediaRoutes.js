// routes/mediaRoutes.js
import express from 'express';
import * as controller from '../controllers/mediaController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, 'frontend/uploads/');

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const upload = multer({ storage: storage });
router.post('/upload/:userId', upload.single('file'), controller.addMedia);


router.get('/getmediafiles', (req, res, next) => {
  console.log("Request made to /getmediafiles");
  next(); 
}, controller.getMediaFiles);

router.get('/getall', controller.getAllMedia);
router.get('/getmediabyid/:id', controller.getMediaById);
// router.delete('/:id', controller.deleteMedia);
router.put('/update/:id', (req,res,next) =>{
  console.log("Request made to /update/:id");
  next(); 
},controller.updateMedia);
router.delete('/delete/:id', controller.deleteMedia);
router.get('/mediabyuser/:userId', controller.getMediaByUserId);



export default router;
