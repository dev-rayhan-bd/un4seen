import express from 'express';
import auth from '../../middleware/auth';
import { IdeaControllers } from './idea.controller';

const router = express.Router();

router.post('/submit', auth('member', 'admin'), IdeaControllers.submitIdea);
router.get('/', auth('member', 'admin', 'superAdmin'), IdeaControllers.getIdeas);
router.patch('/:id/upvote', auth('member', 'admin'), IdeaControllers.toggleUpvote);

// Admin Routes
router.patch('/admin/status/:id',
     auth('admin', 'superAdmin'),
 IdeaControllers.adminApproveIdea);
router.get('/categories', auth('member', 'admin', 'superAdmin'), IdeaControllers.getCategories);
export const IdeaRoutes = router;