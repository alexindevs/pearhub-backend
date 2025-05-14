import { Request, Response, NextFunction } from 'express';
import { BusinessService } from '../services/business.service';
import { UpdateBusinessSchema } from '../validators/business.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
  const businessService = new BusinessService();

export class BusinessController {

  async getMyBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' })
        return;
      }

      const business = await businessService.getMyBusiness(businessId);
      res.status(200).json(business);
    } catch (error) {
      next(error);
    }
  }

  async updateMyBusiness(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' })
        return;
      }

      const data = UpdateBusinessSchema.parse(req.body);
      const updated = await businessService.updateMyBusiness(businessId, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async getPublicBusinessMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const meta = await businessService.getPublicBusinessMeta(slug);
      res.status(200).json(meta);
    } catch (error) {
      next(error);
    }
  }
}