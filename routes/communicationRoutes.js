import express from 'express';

const router = express.Router();
import {
  requestCommunication,
  getRequestsForAstrologer,
  updateRequestStatus,
  getRequestsForUser,
} from '../controllers/communicationController.js';

// POST: Request communication (chat/call/videoCall)
router.post('/request', requestCommunication);

// GET: Get all requests for a specific astrologer
router.get('/requests/:astrologerId', getRequestsForAstrologer);
router.patch('/update-status/:requestId', updateRequestStatus);
// GET: Get all requests for a specific user
router.get('/user/:userId', getRequestsForUser);


export default router;
