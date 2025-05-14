import { Response, NextFunction } from 'express';
import { ContentService } from '../services/content.service';
import { ContentSchema } from '../validators/content.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const contentService = new ContentService();

export class ContentController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' });
        return;
      }

      const data = ContentSchema.parse(req.body);
      const content = await contentService.createContent({ ...data, businessId });
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' });
        return;
      }

      const content = await contentService.getAllContent(businessId);
      res.status(200).json(content);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      const { id } = req.params;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' });
        return;
      }

      const content = await contentService.getContentById(id, businessId);
      res.status(200).json(content);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      const { id } = req.params;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' });
        return;
      }

      const data = ContentSchema.parse(req.body);
      const updated = await contentService.updateContent(id, businessId, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user?.businessId;
      const { id } = req.params;
      if (!businessId) {
        res.status(403).json({ message: 'Not a business account' });
        return;
      }

      await contentService.deleteContent(id, businessId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
