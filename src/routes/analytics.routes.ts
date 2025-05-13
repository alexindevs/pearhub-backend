import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new AnalyticsController();

router.use(requireAuth, authorizeRole([Role.BUSINESS]));

router.get('/overview', controller.overview.bind(controller));
router.get('/memberships', controller.memberships.bind(controller));
router.get('/engagement', controller.engagement.bind(controller));
router.get('/top-content', controller.topContent.bind(controller));
router.get('/trends', controller.trends.bind(controller));

export default router;
