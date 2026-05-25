import express from 'express';
import { finalizeProblems } from '../controllers/finalizeController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, finalizeProblems);

export default router;
