import { Router } from 'express';
import { MembershipController } from '../controllers/membership.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new MembershipController();

router.use(requireAuth, authorizeRole([Role.MEMBER]));

router.post('/', controller.join.bind(controller));
router.get('/', controller.getMyMemberships.bind(controller));
router.delete('/:id', controller.leave.bind(controller));

export default router;
