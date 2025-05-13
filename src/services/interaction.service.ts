import { ApiError } from '../utils/api-error';
import { InteractionType } from '../../generated/prisma';
import { InteractionRepository } from '../repositories/interaction.repository';
import prisma from '../prisma/client';

export class InteractionService {
  private repo = new InteractionRepository();

  async interact(data: {
    userId: string;
    contentId: string;
    type: InteractionType;
    payload?: string;
  }) {
    const content = await prisma.content.findUnique({
      where: { id: data.contentId },
    });
    if (!content) throw new ApiError('Content not found', 404);
  
    await this.repo.upsertViewIfMissing(data.userId, data.contentId, content.businessId);
  
    if (data.type === 'SHARE') {
      if (!data.payload) {
        throw new ApiError('Missing share UUID', 400);
      }
  
      return this.repo.createShare({
        userId: data.userId,
        contentId: data.contentId,
        businessId: content.businessId,
        payload: data.payload,
      });
    }
  
    const exists = await this.repo.findInteraction(data.userId, data.contentId, data.type);
    if (exists) {
      throw new ApiError(`You already ${data.type.toLowerCase()}d this post`, 400);
    }
  
    return this.repo.createInteraction({
      userId: data.userId,
      contentId: data.contentId,
      type: data.type,
      businessId: content.businessId,
      payload: data.payload,
    });
  }
  

  async removeInteraction(data: {
    userId: string;
    contentId: string;
    type: InteractionType;
  }) {
    const exists = await this.repo.findInteraction(data.userId, data.contentId, data.type);
    if (!exists) throw new ApiError('Interaction not found', 404);
  
    return this.repo.deleteInteraction(data);
  }
  
}
