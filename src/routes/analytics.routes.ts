import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth, authorizeRole([Role.BUSINESS]));

router.get('/overview', controller.overview);
router.get('/memberships', controller.memberships);
router.get('/engagement', controller.engagement);
router.get('/top-content', controller.topContent);
router.get('/trends', controller.trends);
router.get('/content-type-distribution', controller.contentTypeDistribution);
router.get('/posts-published', controller.postsPublishedOverTime);
router.get('/average-interactions', controller.averageInteractionsPerType);
router.get('/active-members', controller.activeMembers);
router.get('/content/:contentId/details', controller.contentDetails);

export default router;
