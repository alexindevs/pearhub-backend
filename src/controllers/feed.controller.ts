import { Response, NextFunction } from 'express';
import { FeedService } from '../services/feed.service';
import { FeedQuerySchema } from '../validators/feed.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Role } from '../../generated/prisma';
import { ApiError } from '../utils/api-error';

const feedService = new FeedService();

export class FeedController {
  /**
   * Get personalized feed content for a user
   * @param req - The request object containing user info and query parameters
   * @param res - The response object
   * @param next - The next middleware function
   * @returns JSON response with ranked feed content and pagination metadata
   */
  async getFeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;

      if (!user || user.role !== Role.MEMBER) {
        throw new ApiError('Only MEMBERS can access feed.', 403);
      }

      const { businessSlug } = req.params;
      
      const { page = 1, limit = 10 } = FeedQuerySchema.parse(req.query);
      
      const result = await feedService.getRankedFeedContent(
        user.userId, 
        businessSlug, 
        Number(page), 
        Number(limit)
      );

      res.status(200).json({ 
        data: result.contents,
        pagination: {
          ...result.pagination,
          hasMore: result.pagination.page < result.pagination.totalPages
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getContentDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { contentId } = req.params;
      const userId = req.user?.userId;
  
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const content = await feedService.getContentDetails(contentId, userId);
      res.status(200).json(content);
    } catch (err) {
      next(err);
    }
  }
}