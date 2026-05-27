import express from 'express';
import { firebaseLogin,googleLogin } from '../controllers/firebaseLogin.js';

// routes/firebase.routes.js
const router = express.Router();


router.post("/login", firebaseLogin);
router.post("/google-login", googleLogin);
export default router;
