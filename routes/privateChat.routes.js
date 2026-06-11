import express from 'express';
import {
  getChatHistory,
  getAstrologerThreads,
  sendMessage
} from '../controllers/privateChatController.js';

const router = express.Router();


/* ==========================
   SEND MESSAGE
========================== */
router.post("/send", sendMessage);


/* ==========================
   CHAT HISTORY
========================== */
router.get("/history/:userId/:astroId", getChatHistory);

/* ==========================
   ASTROLOGER THREADS
========================== */
router.get("/astrologer/:astrologerId/threads", getAstrologerThreads);



export default router;