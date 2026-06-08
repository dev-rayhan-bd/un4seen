import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import express from 'express';
import { TestRiderController } from "./testRider.controller";
import { TestRiderValidations } from "./testRider.validation";

const router = express.Router();
router.post('/apply', auth('member'), TestRiderController.submitApplication);


router.get('/admin/all', auth('admin', 'superAdmin'), TestRiderController.getApplications);
router.patch(
  '/admin/review/:id',
  auth('admin', 'superAdmin'),TestRiderController.reviewApplication
);
export const TestRiderRoutes = router;