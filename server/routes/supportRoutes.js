import express from 'express';
import { supportChat, submitComplaint } from '../controllers/supportController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', supportChat);
router.post('/complaint', optionalAuth, submitComplaint);

export default router;
