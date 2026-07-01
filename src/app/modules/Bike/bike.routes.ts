import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { BikeControllers } from './bike.controller';

const router = express.Router();

router.post(
  '/add-bike',
  auth('member'),
  upload.single('image'),
  BikeControllers.addBike
);

router.get('/profile', auth('member'), BikeControllers.getUserBikeProfile);

router.patch(
  '/:id', 
  auth('member', 'admin'), 
  upload.single('image'), 
  BikeControllers.updateBike
);
router.post('/save/:id', auth('member'), BikeControllers.toggleSaveBike);
router.get('/my-saved', auth('member'), BikeControllers.getSavedBikes);
router.get('/:id', auth('member', 'admin'), BikeControllers.getSingleBike);
router.get('/:id/gallery', auth('member', 'admin'), BikeControllers.getBikeGallery);
router.patch(
  '/:id/add-to-gallery',
  auth('member', 'admin'),
  upload.array('images', 10), 
  BikeControllers.uploadToGallery
);
router.patch(
  '/:id/remove-images',
  auth('member', 'admin'),
  BikeControllers.deleteGalleryImages
);
router.delete('/retired/:id', auth('member'), BikeControllers.deleteRetiredBike);
export const BikeRoutes = router;