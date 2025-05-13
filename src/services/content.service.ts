import { ContentRepository } from '../repositories/content.repository';
import { ApiError } from '../utils/api-error';
import { ContentType } from '../../generated/prisma';

export class ContentService {
  private contentRepo = new ContentRepository();

  async createContent(data: {
    title: string;
    description: string;
    type: ContentType;
    body: string;
    mediaUrl?: string;
    tags: string[];
    businessId: string;
  }) {
    return this.contentRepo.createContent(data);
  }

  async getAllContent(businessId: string) {
    return this.contentRepo.getAllContentByBusiness(businessId);
  }

  async getContentById(id: string, businessId: string) {
    const content = await this.contentRepo.getContentById(id);
    if (!content) throw new ApiError('Content not found', 404);
    if (content.businessId !== businessId)
      throw new ApiError('Unauthorized access to content', 403);
    return content;
  }

  async updateContent(id: string, businessId: string, updates: Partial<{
    title: string;
    description: string;
    body: string;
    mediaUrl?: string;
    tags: string[];
    type: ContentType;
  }>) {
    const content = await this.getContentById(id, businessId);
    return this.contentRepo.updateContent(id, updates);
  }

  async deleteContent(id: string, businessId: string) {
    const content = await this.getContentById(id, businessId);
    return this.contentRepo.deleteContent(id);
  }
}
