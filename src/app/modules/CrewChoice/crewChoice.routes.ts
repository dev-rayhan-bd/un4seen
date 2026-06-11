import express from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { CrewChoiceControllers } from './crewChoice.controller';
import { CrewChoiceValidations } from './crewChoice.validation';

const router = express.Router();

router.post(
  '/create', 
//   auth('admin', 'superAdmin'), 
  validateRequest(CrewChoiceValidations.createPollSchema), 
  CrewChoiceControllers.createPoll
);

router.get('/', auth('member', 'admin', 'guest'), CrewChoiceControllers.getPolls);

router.patch(
  '/vote', 
  auth('member'), 
  validateRequest(CrewChoiceValidations.voteSchema), 
  CrewChoiceControllers.votePoll
);
router.get('/past-results', auth('member', 'admin'), CrewChoiceControllers.getPastPolls);
export const CrewChoiceRoutes = router;