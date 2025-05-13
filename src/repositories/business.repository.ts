import prisma from '../prisma/client';

export class BusinessRepository {
  async createBusiness(data: {
    name: string;
    slug: string;
    ownerId: string;
    logo?: string;
  }) {
    return prisma.business.create({
      data,
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const business = await prisma.business.findUnique({
      where: { slug },
    });
    return !!business;
  }

  async findBusinessBySlug(slug: string) {
    return prisma.business.findUnique({ where: { slug } });
  }

  async findBusinessById(id: string) {
    return prisma.business.findUnique({ where: { id } });
  }

  async findBusinessByOwnerId(ownerId: string) {
    return prisma.business.findUnique({ where: { ownerId } });
  }

    async updateBusiness(id: string, updates: Partial<{ name: string, logo: string }>) {
        return prisma.business.update({
        where: { id },
        data: updates,
        });
    }
}
