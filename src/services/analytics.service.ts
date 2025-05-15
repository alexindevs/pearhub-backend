import { AnalyticsRepository } from '../repositories/analytics.repository';

export class AnalyticsService {
  private repo = new AnalyticsRepository();

  private resolveDateRange(query?: {
    type?: 'daily' | 'weekly' | 'monthly';
    day?: string;
    week?: 'current' | 'previous';
    month?: string;
  }): { from: Date; to: Date } {
    const now = new Date();
    const today = new Date(now.toDateString());

    const { type = 'daily', day, week = 'current', month } = query || {};

    if (type === 'daily') {
      const target = day ? new Date(day) : today;
      const from = new Date(target);
      const to = new Date(from);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }

    if (type === 'weekly') {
      const base = new Date(today);
      const dayOfWeek = base.getDay(); // 0 (Sun) – 6 (Sat)
      const offset = week === 'previous' ? 7 : 0;

      const sunday = new Date(base);
      sunday.setDate(sunday.getDate() - dayOfWeek - offset);
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      saturday.setHours(23, 59, 59, 999);

      return { from: sunday, to: saturday };
    }

    if (type === 'monthly') {
      const [year, monthStr] = (month ?? `${now.getFullYear()}-${now.getMonth() + 1}`).split('-');
      const yearNum = Number(year);
      const monthNum = Number(monthStr) - 1; // JS months are 0-indexed

      const from = new Date(yearNum, monthNum, 1);
      const to = new Date(yearNum, monthNum + 1, 0); // last day of the month
      to.setHours(23, 59, 59, 999);

      return { from, to };
    }

    // fallback: today
    return { from: today, to: new Date(today.getTime() + 86400000 - 1) };
  }

  getTotalStats(businessId: string) {
    return this.repo.getTotalContentStats(businessId);
  }

  getMembershipTotal(businessId: string) {
    return this.repo.getMembershipCount(businessId);
  }

  getNewMemberships(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getNewMembershipsInRange(businessId, from, to);
  }

  getEngagementCounts(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getInteractionCountsInRange(businessId, from, to);
  }

  getTopContent(businessId: string, range?: any, limit = 5) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getTopContentByInteractions(businessId, from, to, limit);
  }

  getTrendBreakdown(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getDailyEngagementTrends(businessId, from, to);
  }

  getContentTypeDistribution(businessId: string) {
    return this.repo.getContentTypeDistribution(businessId);
  }

  getPostsPublishedOverTime(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getPostsPublishedOverTime(businessId, from, to);
  }

  getAverageInteractionsPerType(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getAverageInteractionsPerType(businessId, from, to);
  }

  getActiveMembers(businessId: string, range?: any) {
    const { from, to } = this.resolveDateRange(range);
    return this.repo.getActiveMembers(businessId, from, to);
  }

  getContentDetails(businessId: string, contentId: string) {
    return this.repo.getContentDetails(businessId, contentId);
  }
}
