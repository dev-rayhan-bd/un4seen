import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { Un4seenWorldControllers } from './un4seenWorld.controller';

const router = express.Router();

router.get('/', auth('member', 'admin', 'superAdmin'), Un4seenWorldControllers.getAllBrands);

router.post(
  '/create',
  auth('admin', 'superAdmin'),
  upload.single('image'),
  Un4seenWorldControllers.createBrand
);

router.patch(
  '/:id',
  auth('admin', 'superAdmin'),
  upload.single('image'),
  Un4seenWorldControllers.updateBrand
);

router.delete('/:id', auth('admin', 'superAdmin'), Un4seenWorldControllers.deleteBrand);

export const Un4seenWorldRoutes = router;