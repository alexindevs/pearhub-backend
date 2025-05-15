import prisma from '../prisma/client';
import { Content, Interaction } from "../../generated/prisma";
import { PrismaClient } from '../../generated/prisma';

export interface ContentWithMetrics {
  id: string;
  title: string;
  description: string;
  type: string;
  body: string;
  mediaUrl: string | null;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  user_interactions: {
    [key: string]: boolean;
  };
  [key: string]: any;
}
export class FeedRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getBusinessIdBySlug(slug: string): Promise<string | null> {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    return business?.id || null;
  }

  async getContentsByBusinessId(businessId: string): Promise<Content[]> {
    return this.prisma.content.findMany({
      where: { businessId },
      include: {
        // Include count of interaction types for popularity scoring
        _count: {
          select: {
            interactions: {
              where: {
                OR: [
                  { type: 'LIKE' },
                  { type: 'COMMENT' },
                  { type: 'CLICK' },
                  { type: 'SHARE' },
                  { type: 'VIEW' }
                ]
              }
            }
          }
        },
        // Include the interactions for more detailed counts
        interactions: {
          select: {
            type: true
          }
        }
      }
    });
  }

  async getUserInteractionsByBusinessId(
    userId: string, 
    businessId: string
  ): Promise<Interaction[]> {
    return this.prisma.interaction.findMany({
      where: {
        userId,
        businessId
      },
      include: {
        content: {
          select: {
            id: true,
            tags: true
          }
        }
      }
    });
  }

  async enrichContentWithMetrics(
    contents: (Content & { interactions?: Interaction[] })[],
    userInteractions: Interaction[] = []
  ): Promise<ContentWithMetrics[]> {
    // Build map of contentId → { VIEW: true, LIKE: true, ... }
    const userMap: Record<string, Record<string, boolean>> = {};
  
    for (const i of userInteractions) {
      if (!userMap[i.contentId]) {
        userMap[i.contentId] = {};
      }
      userMap[i.contentId][i.type] = true;
    }
  
    return contents.map((content) => {
      const likes = content.interactions?.filter((i) => i.type === 'LIKE').length || 0;
      const clicks = content.interactions?.filter((i) => i.type === 'CLICK').length || 0;
      const comments = content.interactions?.filter((i) => i.type === 'COMMENT').length || 0;
      const shares = content.interactions?.filter((i) => i.type === 'SHARE').length || 0;
      const views = content.interactions?.filter((i) => i.type === 'VIEW').length || 0;
  
      return {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        body: content.body,
        mediaUrl: content.mediaUrl,
        tags: content.tags,
        businessId: content.businessId,
        createdAt: content.createdAt,
        likes,
        clicks,
        comments,
        shares,
        views,
        user_interactions: userMap[content.id] || {}  // ← inject here
      };
    });
  }
  
  
}