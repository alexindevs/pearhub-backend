import { Router } from 'express';
import { InteractionController } from '../controllers/interaction.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { requireMembership } from '../middlewares/membership.middleware';
import { Role } from '../../generated/prisma';
import { interactionRateLimiter } from '../middlewares/interaction-rate-limiter.middleware';

const router = Router();
const controller = new InteractionController();

// All routes require:
// - Authenticated MEMBER
// - Membership to business associated with content
router.use(requireAuth, authorizeRole([Role.MEMBER]), requireMembership);

router.post('/', interactionRateLimiter, controller.interact);
router.delete('/', controller.remove);

export default router;
