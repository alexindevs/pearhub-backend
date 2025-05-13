import prisma from '../prisma/client';

export class MembershipRepository {
  async createMembership(data: { userId: string; businessId: string }) {
    return prisma.membership.create({ data });
  }

  async getUserMemberships(userId: string) {
    return prisma.membership.findMany({
      where: { userId },
      include: { business: true }, // for slug + name on frontend
    });
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
}
