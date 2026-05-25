import express from 'express';
import {
  findProblems,
  getHistory,
  getSearchById,
  deleteHistory,
  getTrends,
} from '../controllers/findController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, findProblems);
router.get('/history', optionalAuth, getHistory);
router.get('/history/:id', optionalAuth, getSearchById);
router.delete('/history/:id', optionalAuth, deleteHistory);
router.get('/trends', getTrends);

export default router;
