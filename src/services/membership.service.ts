import { ApiError } from '../utils/api-error';
import { MembershipRepository } from '../repositories/membership.repository';

export class MembershipService {
  private repo = new MembershipRepository();

  async joinBusiness(userId: string, businessId: string) {
    const exists = await this.repo.membershipExists(userId, businessId);
    if (exists) throw new ApiError('Already a member of this business', 400);
    return this.repo.createMembership({ userId, businessId });
  }

  async getMyMemberships(userId: string) {
    return this.repo.getUserMemberships(userId);
  }

  async leaveBusiness(userId: string, membershipId: string) {
    const membership = await this.repo.findMembershipById(membershipId);
    if (!membership) throw new ApiError('Membership not found', 404);
    if (membership.userId !== userId)
      throw new ApiError('Not your membership', 403);

    return this.repo.deleteMembership(membershipId);
  }

  async isMember(userId: string, businessId: string) {
    const membership = await this.repo.membershipExists(userId, businessId);
    if (!membership) throw new ApiError('Not a member of this business', 403);
    return membership;
  }

  async getPotentialMemberships(userId: string) {
    return this.repo.getPotentialMemberships(userId);
  }
}
