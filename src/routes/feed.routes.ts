import { Router } from 'express';
import { FeedController } from '../controllers/feed.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new FeedController();

router.get(
  '/:businessSlug',
  requireAuth,
  authorizeRole([Role.MEMBER]),
  controller.getFeed
);

export default router;