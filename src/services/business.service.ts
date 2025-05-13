import { log } from 'console';
import { BusinessRepository } from '../repositories/business.repository';
import { ApiError } from '../utils/api-error';

export class BusinessService {
  private bizRepo = new BusinessRepository();

  async getMyBusiness(businessId: string) {
    const business = await this.bizRepo.findBusinessById(businessId);
    if (!business) throw new ApiError('Business not found', 404);
    return business;
  }

  async updateMyBusiness(businessId: string, updates: {
    name?: string;
    logo?: string;
  }) {
    const existing = await this.bizRepo.findBusinessById(businessId);
    if (!existing) throw new ApiError('Business not found', 404);

    return this.bizRepo.updateBusiness(businessId, updates);
  }

  async getPublicBusinessMeta(slug: string) {
    const business = await this.bizRepo.findBusinessBySlug(slug);
    if (!business) throw new ApiError('Business not found', 404);

    return {
      name: business.name,
      slug: business.slug,
      logo: business.logo,
    };
  }
}
