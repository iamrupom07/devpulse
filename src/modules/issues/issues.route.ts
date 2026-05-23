import { Router } from 'express';
import {
  createIssueHandler,
  getAllIssuesHandler,
  getIssueByIdHandler,
  updateIssueHandler,
  deleteIssueHandler,
} from './issues.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', getAllIssuesHandler);
router.get('/:id', getIssueByIdHandler);

router.post('/', authenticate, createIssueHandler);
router.patch('/:id', authenticate, updateIssueHandler);
router.delete('/:id', authenticate, requireRole('maintainer'), deleteIssueHandler);

export default router;
