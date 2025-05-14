import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { authorizeRole } from '../middlewares/role.middleware';
import { Role } from '../../generated/prisma';

const router = Router();
const controller = new ContentController();

router.use(requireAuth, authorizeRole([Role.BUSINESS]));

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
