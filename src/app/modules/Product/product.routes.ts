import express from 'express';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/multer';
import { ProductControllers } from './product.controller';

const router = express.Router();


router.get('/', auth('member', 'admin', 'guest'), ProductControllers.getProducts);

router.post(
  '/upload', 
  auth('admin', 'superAdmin'), 
  upload.single('image'), 
  ProductControllers.createProduct
);

export const ProductRoutes = router;