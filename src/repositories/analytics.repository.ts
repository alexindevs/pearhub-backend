import prisma from '../prisma/client';

export class AnalyticsRepository {
  async getTotalContentStats(businessId: string) {
    const [views, likes, clicks, comments, shares] = await Promise.all([
      prisma.interaction.count({
        where: { businessId, type: 'VIEW' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'LIKE' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'CLICK' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'COMMENT' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'SHARE' },
      }),
    ]);

    return { views, likes, clicks, comments, shares };
  }

  async getMembershipCount(businessId: string) {
    return prisma.membership.count({ where: { businessId } });
  }

  async getNewMembershipsInRange(businessId: string, from: Date, to: Date) {
    return prisma.membership.count({
      where: {
        businessId,
        createdAt: { gte: from, lte: to },
      },
    });
  }

  async getInteractionCountsInRange(businessId: string, from: Date, to: Date) {
    const types = ['VIEW', 'LIKE', 'CLICK', 'COMMENT', 'SHARE'] as const;

    const counts = await Promise.all(
      types.map((type) =>
        prisma.interaction.count({
          where: {
            businessId,
            type,
            createdAt: { gte: from, lte: to },
          },
        })
      )
    );

    return types.reduce((acc, type, i) => {
      acc[type] = counts[i];
      return acc;
    }, {} as Record<typeof types[number], number>);
  }

  async getTopContentByInteractions(businessId: string, from: Date, to: Date, limit = 5) {
    const result = await prisma.interaction.groupBy({
      by: ['contentId'],
      where: {
        businessId,
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const contentIds = result.map((r) => r.contentId);

    const content = await prisma.content.findMany({
      where: { id: { in: contentIds } },
    });

    return result.map((entry) => {
      const contentItem = content.find((c) => c.id === entry.contentId);
      return {
        contentId: entry.contentId,
        title: contentItem?.title,
        interactionCount: entry._count._all,
      };
    });
  }

  async getDailyEngagementTrends(businessId: string, from: Date, to: Date) {
    return prisma.interaction.groupBy({
      by: ['type'],
      where: {
        businessId,
        createdAt: { gte: from, lte: to },
      },
      _count: true,
    });
  }

  // New methods
  async getContentTypeDistribution(businessId: string) {
    const distribution = await prisma.content.groupBy({
      by: ['type'],
      where: {
        businessId,
      },
      _count: true,
    });

    return distribution.map((item) => ({
      type: item.type,
      count: item._count,
    }));
  }

  async getPostsPublishedOverTime(businessId: string, from: Date, to: Date) {
    // Determine interval based on date range (if range > 30 days, use weekly, otherwise daily)
    const dayDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const interval = dayDiff > 30 ? 'week' : 'day';
    
    if (interval === 'day') {
      // Group by day
      const posts: any = await prisma.$queryRaw`
        SELECT 
          DATE(c."createdAt") as date,
          COUNT(*) as count
        FROM "Content" c
        WHERE 
          c."businessId" = ${businessId}
          AND c."createdAt" >= ${from}
          AND c."createdAt" <= ${to}
        GROUP BY DATE(c."createdAt")
        ORDER BY date ASC
      `;
      
      return posts.map((p: any) => ({
  ...p,
  count: typeof p.count === 'bigint' ? Number(p.count) : p.count,
}));;
    } else {
      // Group by week
      const posts: any = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('week', c."createdAt") as week_start,
          COUNT(*) as count
        FROM "Content" c
        WHERE 
          c."businessId" = ${businessId}
          AND c."createdAt" >= ${from}
          AND c."createdAt" <= ${to}
        GROUP BY week_start
        ORDER BY week_start ASC
      `;
      
      return posts.map((p: any) => ({
  ...p,
  count: typeof p.count === 'bigint' ? Number(p.count) : p.count,
}));;
    }
  }

  async getAverageInteractionsPerType(businessId: string, from: Date, to: Date) {
    // Get count of content by type
    const contentCounts = await prisma.content.groupBy({
      by: ['type'],
      where: {
        businessId,
        createdAt: { gte: from, lte: to },
      },
      _count: true,
    });

    // Get interactions by content type
    const interactionsByType = await prisma.$queryRaw`
      SELECT 
        c.type as "contentType",
        i.type as "interactionType",
        COUNT(*) as count
      FROM "Interaction" i
      JOIN "Content" c ON i."contentId" = c.id
      WHERE 
        i."businessId" = ${businessId}
        AND i."createdAt" >= ${from}
        AND i."createdAt" <= ${to}
      GROUP BY c.type, i.type
    `;

    // Calculate averages
    const contentTypeMap = contentCounts.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Transform the result into a more usable format
    const interactionTypes = ['VIEW', 'LIKE', 'COMMENT', 'SHARE'];
    const result = {} as Record<string, Record<string, number>>;

    for (const contentType of Object.keys(contentTypeMap)) {
      result[contentType] = {} as Record<string, number>;
      
      for (const interactionType of interactionTypes) {
        const entry = (interactionsByType as any[]).find(
          (item) => item.contentType === contentType && item.interactionType === interactionType
        );
        
        const count = entry ? Number(entry.count) : 0;
        const contentCount = contentTypeMap[contentType] || 1; // Avoid division by zero
        
        result[contentType][interactionType] = count / contentCount;
      }

      // Add total average
      const totalInteractions = interactionTypes.reduce((sum, type) => sum + (result[contentType][type] || 0), 0);
      result[contentType].TOTAL = totalInteractions;
    }

    return result;
  }

  async getActiveMembers(businessId: string, from: Date, to: Date) {
    // Get total members
    const totalMembers = await this.getMembershipCount(businessId);
    
    // Get active members (those who had any interaction in the date range)
    const activeMembers = await prisma.user.count({
      where: {
        interactions: {
          some: {
            businessId,
            createdAt: { gte: from, lte: to },
          },
        },
        memberships: {
          some: {
            businessId,
          },
        },
      },
    });

    return {
      totalMembers,
      activeMembers,
      activeMembersPercentage: totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0,
    };
  }

  async getContentDetails(businessId: string, contentId: string) {
    // Get content info
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
      },
    });

    if (!content || content.id !== contentId) {
      throw new Error('Content not found');
    }

    // Get interaction stats
    const interactions = await prisma.interaction.groupBy({
      by: ['type'],
      where: {
        contentId,
        businessId,
      },
      _count: true,
    });

    // Format the response
    const interactionCounts = interactions.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...content,
      interactions: interactionCounts,
    };
  }
}
