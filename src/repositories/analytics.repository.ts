import prisma from '../prisma/client';

export class AnalyticsRepository {
  async getTotalContentStats(businessId: string) {
    const [views, likes,  comments, shares] = await Promise.all([
      prisma.interaction.count({
        where: { businessId, type: 'VIEW' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'LIKE' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'COMMENT' },
      }),
      prisma.interaction.count({
        where: { businessId, type: 'SHARE' },
      }),
    ]);

    return { views, likes, comments, shares };
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
    const types = ['VIEW', 'LIKE', 'COMMENT', 'SHARE'] as const;

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
}
