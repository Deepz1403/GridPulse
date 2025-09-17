import express from 'express';
import { submitPowerData } from '../controllers/powerdatacontroller.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit',isAuthenticated, submitPowerData);

export default router;
