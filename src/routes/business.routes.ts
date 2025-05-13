import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new BusinessController();

router.get('/me', requireAuth, authorizeRole([Role.BUSINESS]), controller.getMyBusiness.bind(controller));
router.put('/me', requireAuth, authorizeRole([Role.BUSINESS]), controller.updateMyBusiness.bind(controller));
router.get('/:slug/meta', controller.getPublicBusinessMeta.bind(controller));

export default router;
