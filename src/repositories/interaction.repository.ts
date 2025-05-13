import prisma from '../prisma/client';
import { InteractionType } from '../../generated/prisma';

export class InteractionRepository {
  async findInteraction(userId: string, contentId: string, type: InteractionType) {
    return prisma.interaction.findUnique({
      where: {
        userId_contentId_type: {
          userId,
          contentId,
          type,
        },
      },
    });
  }

  async createInteraction(data: {
    userId: string;
    contentId: string;
    type: InteractionType;
    businessId: string;
    payload?: string;
  }) {
    return prisma.interaction.create({ data });
  }

  async upsertViewIfMissing(userId: string, contentId: string, businessId: string) {
    const exists = await this.findInteraction(userId, contentId, 'VIEW');
    if (!exists) {
      return prisma.interaction.create({
        data: {
          userId,
          contentId,
          businessId,
          type: 'VIEW',
        },
      });
    }
  }

  async deleteInteraction(data: {
    userId: string;
    contentId: string;
    type: InteractionType;
  }) {
    return prisma.interaction.delete({
      where: {
        userId_contentId_type: {
          userId: data.userId,
          contentId: data.contentId,
          type: data.type,
        },
      },
    });
  }
  
  async createShare(data: {
    userId: string;
    contentId: string;
    businessId: string;
    payload: string; // this is the share UUID
  }) {
    // Check if share already exists
    const existing = await this.findInteraction(data.userId, data.contentId, 'SHARE');
    if (existing) {
      throw new Error('You have already shared this content');
    }

    // Create a view if not logged
    await this.upsertViewIfMissing(data.userId, data.contentId, data.businessId);

    return this.createInteraction({
      ...data,
      type: 'SHARE',
    });
  }
}
