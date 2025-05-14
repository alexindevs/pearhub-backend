import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new BusinessController();

router.get('/me', requireAuth, authorizeRole([Role.BUSINESS]), controller.getMyBusiness);
router.put('/me', requireAuth, authorizeRole([Role.BUSINESS]), controller.updateMyBusiness);
router.get('/:slug/meta', controller.getPublicBusinessMeta);

export default router;
