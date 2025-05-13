import prisma from '../prisma/client';
import { ContentType } from '../../generated/prisma';

export class ContentRepository {
  async createContent(data: {
    title: string;
    description: string;
    type: ContentType;
    body: string;
    mediaUrl?: string;
    tags: string[];
    businessId: string;
  }) {
    return prisma.content.create({ data });
  }

  async getAllContentByBusiness(businessId: string) {
    return prisma.content.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getContentById(id: string) {
    return prisma.content.findUnique({ where: { id } });
  }

  async updateContent(id: string, data: Partial<{
    title: string;
    description: string;
    body: string;
    mediaUrl?: string;
    tags: string[];
    type: ContentType;
  }>) {
    return prisma.content.update({
      where: { id },
      data,
    });
  }

  async deleteContent(id: string) {
    return prisma.content.delete({ where: { id } });
  }
}
