import { Response, NextFunction } from 'express';
import { InteractionService } from '../services/interaction.service';
import { InteractionSchema, DeleteInteractionSchema } from '../validators/interaction.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const interactionService = new InteractionService();

export class InteractionController {
  async interact(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const data = InteractionSchema.parse(req.body);
      const interaction = await interactionService.interact({ ...data, userId });

      res.status(201).json(interaction);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const data = DeleteInteractionSchema.parse(req.query);
      await interactionService.removeInteraction({ ...data, userId });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
