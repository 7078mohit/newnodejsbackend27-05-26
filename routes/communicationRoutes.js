import express from 'express';

const router = express.Router();
import {
  createCommunicationRequest,
  getRequestsForAstrologer,
  updateRequestStatus,
  getRequestsForUser,
} from '../controllers/communicationController.js';

// POST: Request communication (chat/call/videoCall)
router.post('/create-request', createCommunicationRequest);

// GET: Get all requests for a specific astrologer
router.get('/requests/:astrologerId', getRequestsForAstrologer);

//update status
router.patch('/update-status/:requestId', updateRequestStatus);

// GET: Get all requests for a specific user
router.get('/user/:userId', getRequestsForUser);


export default router;
