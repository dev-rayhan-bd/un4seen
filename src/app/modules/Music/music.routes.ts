import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { MusicControllers } from './music.controller';

const router = express.Router();


router.post('/upload', 
    auth('admin', 'superAdmin'), 
    upload.single('audio'), MusicControllers.uploadMusic);


router.get('/', auth('member', 'admin'), MusicControllers.getMusicLibrary);


router.post('/favorite/:id', auth('member'), MusicControllers.toggleFavorite);

router.get('/categories', auth('member', 'admin'), MusicControllers.getCategories);


router.delete('/:id', auth('admin', 'superAdmin'), MusicControllers.deleteMusic);
router.get(
  '/my-favorites', 
  auth('member', 'admin'), 
  MusicControllers.getMyFavorites
);
export const MusicRoutes = router;