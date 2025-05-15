import prisma from '../prisma/client';

export class MembershipRepository {
  async createMembership(data: { userId: string; businessId: string }) {
    return prisma.membership.create({ data });
  }

  async getUserMemberships(userId: string) {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const businessIds = memberships.map((m) => m.business.id);

    const interactions = await prisma.interaction.findMany({
      where: {
        userId,
        content: {
          businessId: { in: businessIds },
        },
      },
      select: {
        contentId: true,
      },
    });

    const seenContentIds = new Set(interactions.map((i) => i.contentId));

    const newPostMap: Record<string, boolean> = {};

    const latestPosts = await prisma.content.findMany({
      where: {
        businessId: { in: businessIds },
      },
      select: {
        id: true,
        businessId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const post of latestPosts) {
      if (!seenContentIds.has(post.id)) {
        newPostMap[post.businessId] = true;
      }
    }

    return memberships.map((m) => ({
      ...m,
      business: {
        ...m.business,
        newPost: newPostMap[m.business.id] ?? false,
      },
    }));
  }

  async findMembershipById(id: string) {
    return prisma.membership.findUnique({ where: { id } });
  }

  async deleteMembership(id: string) {
    return prisma.membership.delete({ where: { id } });
  }

  async membershipExists(userId: string, businessId: string): Promise<boolean> {
    const existing = await prisma.membership.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
    return !!existing;
  }

  async getPotentialMemberships(userId: string) {
    const subbedIds = await prisma.membership.findMany({
      where: { userId },
      select: { businessId: true },
    });

    const exclude = subbedIds.map((m) => m.businessId);

    const popularBusinesses = await prisma.business.findMany({
      where: {
        id: { notIn: exclude },
      },
      orderBy: {
        memberships: {
          _count: 'desc',
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    return popularBusinesses;
  }
}
