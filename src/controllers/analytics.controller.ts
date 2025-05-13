import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQuerySchema } from '../validators/analytics.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ApiError } from '../utils/api-error';

const service = new AnalyticsService();

export class AnalyticsController {
  async overview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      
      if (!businessId) {
        throw new ApiError('Business ID is required', 400);
      }
      
      const data = await service.getTotalStats(businessId);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  async memberships(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      
      if (!businessId) {
        throw new ApiError('Business ID is required', 400);
      }
      
      const range = AnalyticsQuerySchema.parse(req.query);
      const data = await service.getNewMemberships(businessId, range);
      res.status(200).json({ count: data });
    } catch (err) {
      next(err);
    }
  }

  async engagement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      
      if (!businessId) {
        throw new ApiError('Business ID is required', 400);
      }
      
      const range = AnalyticsQuerySchema.parse(req.query);
      const data = await service.getEngagementCounts(businessId, range);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  async topContent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      
      if (!businessId) {
        throw new ApiError('Business ID is required', 400);
      }
      
      const range = AnalyticsQuerySchema.parse(req.query);
      const limit = range.limit ?? 5;
      const data = await service.getTopContent(businessId, range, limit);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  async trends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      
      if (!businessId) {
        throw new ApiError('Business ID is required', 400);
      }
      
      const range = AnalyticsQuerySchema.parse(req.query);
      const data = await service.getTrendBreakdown(businessId, range);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
}