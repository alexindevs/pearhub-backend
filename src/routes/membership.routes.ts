import { Router } from 'express';
import { MembershipController } from '../controllers/membership.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new MembershipController();

router.use(requireAuth, authorizeRole([Role.MEMBER]));

router.post('/', controller.join);
router.get('/', controller.getMyMemberships);
router.get("/potential", controller.getPotential);
router.get('/:id', controller.amIAMember);
router.delete('/:id', controller.leave);

export default router;
