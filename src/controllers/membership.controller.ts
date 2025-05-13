import { Request, Response, NextFunction } from 'express';
import { MembershipService } from '../services/membership.service';
import { CreateMembershipSchema } from '../validators/membership.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const membershipService = new MembershipService();

export class MembershipController {
  async join(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const data = CreateMembershipSchema.parse(req.body);
      const result = await membershipService.joinBusiness(userId, data.businessId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyMemberships(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const memberships = await membershipService.getMyMemberships(userId);
      res.status(200).json(memberships);
    } catch (error) {
      next(error);
    }
  }

  async leave(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      await membershipService.leaveBusiness(userId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
