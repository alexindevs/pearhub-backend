import { ContentWithMetrics, FeedRepository } from "../repositories/feed.repository";

interface RankedContent {
  content_id: string;
  score: number;
}

export class FeedService {
  private repository: FeedRepository;

  constructor() {
    this.repository = new FeedRepository();
  }

  // async rankContent(
  //   userId: string,
  //   businessSlug: string,
  //   page?: number,
  //   limit?: number
  // ): Promise<RankedContent[]> {
  //   const businessId = await this.repository.getBusinessIdBySlug(businessSlug);
    
  //   if (!businessId) {
  //     throw new Error(`Business with slug ${businessSlug} not found`);
  //   }

  //   const rawContents = await this.repository.getContentsByBusinessId(businessId);
    
  //   const contentList = await this.repository.enrichContentWithMetrics(rawContents);
    
  //   const interactions = await this.repository.getUserInteractionsByBusinessId(
  //     userId, 
  //     businessId
  //   );

  //   const interactionList = interactions.map(i => ({
  //     content_id: i.contentId,
  //     liked: i.type === 'LIKE',
  //     commented: i.type === 'COMMENT',
  //     shared: i.type === 'SHARE',
  //     viewed: i.type === 'VIEW'
  //   }));

  //   return this.calculateContentRanking(contentList, interactionList, page, limit);
  // }

  private calculateContentRanking(
    contentList: ContentWithMetrics[],
    interactionList: any[],
    page?: number,
    limit?: number
  ): RankedContent[] {
    const interactionMap: Record<string, any> = {};
    interactionList.forEach(i => {
      interactionMap[i.content_id] = i;
    });
  
    const feedbackWeights = {
      liked: 3,
      shared: 5,
      commented: 2,
      viewed: 1
    };
  
    const tagAffinity: Record<string, number> = {};
  
    contentList.forEach(content => {
      const interaction = interactionMap[content.id];
      if (!interaction) return;
  
      let score = 0;
      for (const [type, weight] of Object.entries(feedbackWeights)) {
        if (interaction[type]) score += weight;
      }
  
      content.tags.forEach(tag => {
        tagAffinity[tag] = (tagAffinity[tag] || 0) + score;
      });
    });
  
    const ranked: RankedContent[] = [];
  
    contentList.forEach(content => {
      const tagScore = content.tags.reduce((sum, tag) => sum + (tagAffinity[tag] || 0), 0);
  
      const popularityScore =
        (content.likes || 0) * 1.5 +
        (content.comments || 0) * 1.0 +
        (content.shares || 0) * 2.0 +
        (content.views || 0) * 0.5;
  
      const hoursSinceCreation =
        (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60);
      const freshnessBoost = Math.max(0, 10 - hoursSinceCreation * 0.1);
  
      const viewedPenalty = interactionMap[content.id]?.viewed ? 5 : 0;
  
      const finalScore =
        (tagScore > 0 ? tagScore : popularityScore) +
        freshnessBoost -
        viewedPenalty;
  
      ranked.push({
        content_id: content.id,
        score: finalScore
      });
    });
  
    ranked.sort((a, b) => b.score - a.score);
    
    if (page !== undefined && limit !== undefined) {
      const startIndex = (page - 1) * limit;
      return ranked.slice(startIndex, startIndex + limit);
    }
    
    return ranked;
  }

  async getContentDetails(contentId: string, userId: string): Promise<any> {
    const content = await this.repository.getContentById(contentId);

    if (!content) {
      throw new Error(`Content with ID ${contentId} not found`);
    }

    const stats = await this.repository.getContentStats(contentId);

    const userInteractions = await this.repository.getUserInteractionsByContentId(
      userId,
      contentId
    );

    const comments = await this.repository.getContentComments(contentId);

    return {
      id: content.id,
      title: content.title,
      body: content.body,
      description: content.description,
      type: content.type,
      mediaUrl: content.mediaUrl,
      tags: content.tags,
      createdAt: content.createdAt,
      stats: {
        likes: stats.likes || 0,
        views: stats.views || 0,
        comments: stats.comments || 0,
        shares: stats.shares || 0,
        clicks: stats.clicks || 0,
      },
      user_interactions: {
        LIKE: userInteractions.some((i) => i.type === "LIKE"),
        VIEW: userInteractions.some((i) => i.type === "VIEW"),
        COMMENT: userInteractions.some((i) => i.type === "COMMENT"),
        SHARE: userInteractions.some((i) => i.type === "SHARE"),
        CLICK: userInteractions.some((i) => i.type === "CLICK"),
      },
      comments: comments.map((comment) => ({
        user: comment.user,
        payload: comment.payload,
        createdAt: comment.createdAt,
      })),
    };
  }

  async getRankedFeedContent(
    userId: string,
    businessSlug: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    contents: ContentWithMetrics[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }> {
    const businessId = await this.repository.getBusinessIdBySlug(businessSlug);
    
    if (!businessId) {
      throw new Error(`Business with slug ${businessSlug} not found`);
    }
    
    const rawContents = await this.repository.getContentsByBusinessId(businessId);
        
    const interactions = await this.repository.getUserInteractionsByBusinessId(
      userId, 
      businessId
    );

    const contentList = await this.repository.enrichContentWithMetrics(rawContents, interactions);

    const interactionList = interactions.map(i => ({
      content_id: i.contentId,
      liked: i.type === 'LIKE',
      commented: i.type === 'COMMENT',
      shared: i.type === 'SHARE',
      viewed: i.type === 'VIEW'
    }));

    const allRankings = this.calculateContentRanking(contentList, interactionList);
    
    const total = allRankings.length;
    const totalPages = Math.ceil(total / limit);
    
    const startIndex = (page - 1) * limit;
    const paginatedRankings = allRankings.slice(startIndex, startIndex + limit);
    
    const contentMap: Record<string, ContentWithMetrics> = {};
    contentList.forEach(content => {
      contentMap[content.id] = content;
    });
    
    const contents = paginatedRankings
      .map(rank => contentMap[rank.content_id])
      .filter(content => content !== undefined);
    
    return {
      contents,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}