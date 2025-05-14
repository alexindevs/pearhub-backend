import { Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { ApiError } from '../utils/api-error';
import { AuthenticatedRequest } from './auth.middleware';

export async function requireMembership(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const { userId } = req.user!;
  console.log(req.body)
  const contentId = req.params.contentId || req.body.contentId;
  console.log('Content ID:', contentId);

  if (!contentId) {
    throw new ApiError('Missing contentId for membership check', 400);
  }

  const content = await prisma.content.findUnique({
    where: { id: contentId },
    select: { businessId: true },
  });

  if (!content) throw new ApiError('Content not found', 404);

  const membership = await prisma.membership.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId: content.businessId,
      },
    },
  });

  if (!membership) {
    throw new ApiError('You must be a member to interact with this content', 403);
  }

  next();
}

export async function requireBusinessMembership(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const { userId } = req.user!;
  const { businessId } = req.body || req.params;

  if (!businessId) {
    throw new ApiError('Missing businessId for membership check', 400);
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId,
      },
    },
  });

  if (!membership) {
    throw new ApiError('You must be a member to interact with this content', 403);
  }

  next();
}
