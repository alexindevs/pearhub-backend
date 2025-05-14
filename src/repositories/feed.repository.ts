import prisma from '../prisma/client';
import { Content, Interaction } from "../../generated/prisma";
import { PrismaClient } from '../../generated/prisma';

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

  async enrichContentWithMetrics(contents: (Content & { interactions?: Interaction[] })[]): Promise<{
    id: string;
    title: string;
    description: string;
    type: string;
    body: string;
    mediaUrl: string | null;
    tags: string[];
    businessId: string;
    createdAt: Date;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    [key: string]: unknown;
  }[]> {
    // Process the content to get the metrics in the format we need
    return contents.map((content: Content & { interactions?: Interaction[] }) => {
      // Count different interaction types
      const likes = content.interactions?.filter((i: Interaction) => i.type === 'LIKE').length || 0;
      const comments = content.interactions?.filter((i: Interaction) => i.type === 'COMMENT').length || 0;
      const shares = content.interactions?.filter((i: Interaction) => i.type === 'SHARE').length || 0;
      const views = content.interactions?.filter((i: Interaction) => i.type === 'VIEW').length || 0;

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
        // Add metrics for ranking algorithm
        likes,
        comments,
        shares,
        views
      };
    });
  }
}