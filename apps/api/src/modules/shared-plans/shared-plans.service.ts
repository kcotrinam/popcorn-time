import { Prisma } from '@prisma/client';
import type {
  SharedPlan,
  SharedPlanDetail,
  SharedPlanPage,
  SharedPlanParticipant,
} from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { prisma } from '../../lib/prisma.js';
import { catalogService } from '../catalog/catalog.service.js';
import type {
  CompleteInput,
  CreatePlanInput,
  PlanQuery,
  ProgressInput,
} from './shared-plans.schemas.js';

const identity = { select: { username: true, displayName: true, avatarUrl: true } } as const;
type RecordPlan = Prisma.SharedPlanGetPayload<{
  include: {
    creator: { select: typeof identity.select };
    participants: { include: { user: { select: typeof identity.select } } };
  };
}>;
const publicUser = (user: {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
}) => ({ username: user.username ?? '', displayName: user.displayName, avatarUrl: user.avatarUrl });
const planInclude = {
  creator: identity,
  participants: { include: { user: identity }, orderBy: { invitedAt: 'asc' as const } },
} as const;
const base = (plan: RecordPlan): SharedPlan => ({
  id: plan.id,
  provider: 'tmdb',
  externalId: plan.externalId,
  mediaType: plan.mediaType as SharedPlan['mediaType'],
  title: plan.title,
  posterUrl: plan.posterUrl,
  releaseYear: plan.releaseYear,
  movieRuntimeMinutes: plan.movieRuntimeMinutes,
  status: plan.status,
  creator: publicUser(plan.creator),
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
  completedAt: plan.completedAt?.toISOString() ?? null,
  cancelledAt: plan.cancelledAt?.toISOString() ?? null,
});
const participant = (
  value: RecordPlan['participants'][number],
  runtime: number | null,
): SharedPlanParticipant => ({
  user: publicUser(value.user),
  role: value.role,
  invitationStatus: value.invitationStatus,
  progressStatus: value.progressStatus,
  movieMinute: value.movieMinute,
  currentSeason: value.currentSeason,
  lastWatchedEpisode: value.lastWatchedEpisode,
  progressPercent:
    value.progressStatus === 'WATCHED'
      ? 100
      : runtime && value.movieMinute
        ? Math.round((value.movieMinute / runtime) * 100)
        : 0,
  invitedAt: value.invitedAt.toISOString(),
  acceptedAt: value.acceptedAt?.toISOString() ?? null,
  progressUpdatedAt: value.progressUpdatedAt?.toISOString() ?? null,
  completedAt: value.completedAt?.toISOString() ?? null,
});
const detail = (plan: RecordPlan, viewerId: string): SharedPlanDetail => ({
  ...base(plan),
  participants: plan.participants
    .filter(
      (p) =>
        p.invitationStatus === 'ACCEPTED' || plan.creatorId === viewerId || p.userId === viewerId,
    )
    .map((p) => participant(p, plan.movieRuntimeMinutes)),
});
const inaccessible = () => new AppError(404, ErrorCode.NOT_FOUND, 'Shared plan was not found');
const readonly = (status: string) => {
  if (status === 'COMPLETED' || status === 'CANCELLED')
    throw new AppError(409, ErrorCode.VALIDATION_ERROR, 'This shared plan is read-only');
};
const statusFor = (
  participants: Array<{ role: string; invitationStatus: string; progressStatus: string }>,
) => {
  const accepted = participants.filter((p) => p.invitationStatus === 'ACCEPTED');
  return accepted.length >= 2 && accepted.every((p) => p.progressStatus === 'WATCHED')
    ? 'COMPLETED'
    : accepted.length >= 2
      ? 'ACTIVE'
      : 'PENDING';
};
async function planFor(id: string, userId: string) {
  const plan = await prisma.sharedPlan.findFirst({
    where: { id, participants: { some: { userId } } },
    include: planInclude,
  });
  if (!plan) throw inaccessible();
  return plan;
}
async function ensureLibrary(
  tx: Prisma.TransactionClient,
  userId: string,
  plan: {
    provider: string;
    externalId: number;
    mediaType: string;
    title: string;
    posterUrl: string | null;
    releaseYear: number | null;
  },
) {
  const existing = await tx.userMedia.findUnique({
    where: {
      userId_provider_externalId_mediaType: {
        userId,
        provider: plan.provider,
        externalId: plan.externalId,
        mediaType: plan.mediaType,
      },
    },
  });
  if (!existing)
    await tx.userMedia.create({
      data: {
        userId,
        provider: plan.provider,
        externalId: plan.externalId,
        mediaType: plan.mediaType,
        title: plan.title,
        posterUrl: plan.posterUrl,
        releaseYear: plan.releaseYear,
        genreIds: [],
      },
    });
}
export const sharedPlansService = {
  async create(userId: string, input: CreatePlanInput): Promise<SharedPlanDetail> {
    const users = await prisma.user.findMany({
      where: {
        usernameNormalized: { in: input.usernames.map((v) => v.toLowerCase()) },
        deletedAt: null,
        emailVerifiedAt: { not: null },
      },
    });
    if (
      users.length !== input.usernames.length ||
      new Set(users.map((u) => u.id)).size !== users.length
    )
      throw new AppError(404, ErrorCode.NOT_FOUND, 'One or more users were not found');
    if (users.some((u) => u.id === userId))
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'You cannot invite yourself');
    const content = await catalogService.detail({ type: input.mediaType, id: input.externalId });
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.sharedPlan.create({
        data: {
          creatorId: userId,
          provider: input.provider,
          externalId: input.externalId,
          mediaType: input.mediaType,
          title: content.title,
          posterUrl: content.posterUrl,
          releaseYear: content.releaseYear,
          movieRuntimeMinutes: input.mediaType === 'movie' ? content.runtimeMinutes : null,
          participants: {
            create: [
              { userId, role: 'CREATOR', invitationStatus: 'ACCEPTED', acceptedAt: new Date() },
              ...users.map((u) => ({ userId: u.id })),
            ],
          },
        },
        include: planInclude,
      });
      await ensureLibrary(tx, userId, created);
      return created;
    });
    return detail(result, userId);
  },
  async list(userId: string, query: PlanQuery): Promise<SharedPlanPage> {
    const where: Prisma.SharedPlanWhereInput =
      query.view === 'invitations'
        ? { participants: { some: { userId, invitationStatus: 'PENDING' } } }
        : query.view === 'history'
          ? {
              status: { in: ['COMPLETED', 'CANCELLED'] },
              participants: { some: { userId, invitationStatus: 'ACCEPTED' } },
            }
          : {
              status: { in: ['PENDING', 'ACTIVE'] },
              participants: { some: { userId, invitationStatus: 'ACCEPTED' } },
            };
    const [plans, totalResults] = await prisma.$transaction([
      prisma.sharedPlan.findMany({
        where,
        include: planInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.sharedPlan.count({ where }),
    ]);
    return {
      results: plans.map(base),
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(totalResults / query.pageSize)),
      totalResults,
    };
  },
  async get(userId: string, id: string) {
    return detail(await planFor(id, userId), userId);
  },
  async invite(userId: string, id: string, usernames: string[]) {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.sharedPlan.findFirst({
        where: { id, creatorId: userId },
        include: { participants: true },
      });
      if (!plan) throw inaccessible();
      readonly(plan.status);
      const users = await tx.user.findMany({
        where: {
          usernameNormalized: { in: usernames.map((v) => v.toLowerCase()) },
          deletedAt: null,
          emailVerifiedAt: { not: null },
        },
      });
      if (users.length !== usernames.length || users.some((u) => u.id === userId))
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Invalid invitees');
      if (plan.participants.length + users.length > 10)
        throw new AppError(
          400,
          ErrorCode.VALIDATION_ERROR,
          'A shared plan can have up to 10 users',
        );
      if (users.some((u) => plan.participants.some((p) => p.userId === u.id)))
        throw new AppError(409, ErrorCode.VALIDATION_ERROR, 'A user is already in this plan');
      await tx.sharedPlanParticipant.createMany({
        data: users.map((u) => ({ planId: id, userId: u.id })),
      });
    });
    return this.get(userId, id);
  },
  async accept(userId: string, id: string) {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.sharedPlan.findFirst({
        where: { id },
        include: { participants: true },
      });
      const member = plan?.participants.find((p) => p.userId === userId);
      if (!plan || !member) throw inaccessible();
      readonly(plan.status);
      if (member.invitationStatus === 'PENDING')
        await tx.sharedPlanParticipant.update({
          where: { planId_userId: { planId: id, userId } },
          data: {
            invitationStatus: 'ACCEPTED',
            acceptedAt: new Date(),
            progressStatus: 'NOT_STARTED',
            movieMinute: null,
            currentSeason: null,
            lastWatchedEpisode: null,
          },
        });
      await ensureLibrary(tx, userId, plan);
      const participants = await tx.sharedPlanParticipant.findMany({ where: { planId: id } });
      await tx.sharedPlan.update({
        where: { id },
        data: {
          status: statusFor(
            participants.map((p) => ({
              ...p,
              invitationStatus: p.userId === userId ? 'ACCEPTED' : p.invitationStatus,
            })),
          ),
          completedAt: null,
        },
      });
    });
    return this.get(userId, id);
  },
  async remove(userId: string, id: string, targetId: string) {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.sharedPlan.findFirst({
        where: { id },
        include: { participants: true },
      });
      if (!plan) throw inaccessible();
      readonly(plan.status);
      const creator = plan.creatorId === userId;
      if (targetId === plan.creatorId)
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'The creator cannot leave this plan');
      if (targetId !== userId && !creator)
        throw new AppError(403, ErrorCode.FORBIDDEN, 'Only the creator can remove members');
      const member = plan.participants.find((p) => p.userId === targetId);
      if (!member) throw inaccessible();
      await tx.sharedPlanParticipant.delete({
        where: { planId_userId: { planId: id, userId: targetId } },
      });
      const participants = plan.participants.filter((p) => p.userId !== targetId);
      await tx.sharedPlan.update({
        where: { id },
        data: { status: statusFor(participants), completedAt: null },
      });
    });
  },
  async progress(userId: string, id: string, input: ProgressInput) {
    const plan = await planFor(id, userId);
    readonly(plan.status);
    const member = plan.participants.find((p) => p.userId === userId);
    if (!member || member.invitationStatus !== 'ACCEPTED')
      throw new AppError(403, ErrorCode.FORBIDDEN, 'Accept the invitation first');
    let data: Prisma.SharedPlanParticipantUpdateInput;
    if (plan.mediaType === 'movie') {
      if (
        input.movieMinute === undefined ||
        !plan.movieRuntimeMinutes ||
        input.movieMinute > plan.movieRuntimeMinutes
      )
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Minute is outside the movie runtime');
      data = {
        movieMinute: input.movieMinute,
        progressStatus: input.movieMinute === 0 ? 'NOT_STARTED' : 'WATCHING',
        progressUpdatedAt: new Date(),
      };
    } else {
      if (!input.currentSeason || !input.lastWatchedEpisode)
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Season and episode are required');
      const episodes = await catalogService.seasonEpisodes({
        id: plan.externalId,
        seasonNumber: input.currentSeason,
      });
      if (!episodes.episodes.some((episode) => episode.episodeNumber === input.lastWatchedEpisode))
        throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Episode has not aired');
      data = {
        currentSeason: input.currentSeason,
        lastWatchedEpisode: input.lastWatchedEpisode,
        progressStatus: 'WATCHING',
        progressUpdatedAt: new Date(),
      };
    }
    await prisma.sharedPlanParticipant.update({
      where: { planId_userId: { planId: id, userId } },
      data,
    });
    return this.get(userId, id);
  },
  async complete(userId: string, id: string, input: CompleteInput) {
    await prisma.$transaction(async (tx) => {
      const plan = await tx.sharedPlan.findFirst({
        where: { id },
        include: { participants: true },
      });
      const member = plan?.participants.find((p) => p.userId === userId);
      if (!plan || !member || member.invitationStatus !== 'ACCEPTED') throw inaccessible();
      readonly(plan.status);
      await ensureLibrary(tx, userId, plan);
      await tx.sharedPlanParticipant.update({
        where: { planId_userId: { planId: id, userId } },
        data: { progressStatus: 'WATCHED', completedAt: new Date(), progressUpdatedAt: new Date() },
      });
      await tx.userMedia.updateMany({
        where: {
          userId,
          provider: plan.provider,
          externalId: plan.externalId,
          mediaType: plan.mediaType,
        },
        data: {
          status: 'WATCHED',
          watchedAt: input.watchedAt,
          personalRating: input.rating ?? null,
          privateComment: input.comment ?? null,
        },
      });
      const participants = await tx.sharedPlanParticipant.findMany({ where: { planId: id } });
      const status = statusFor(
        participants.map((p) => ({
          ...p,
          progressStatus: p.userId === userId ? 'WATCHED' : p.progressStatus,
        })),
      );
      await tx.sharedPlan.update({
        where: { id },
        data: { status, completedAt: status === 'COMPLETED' ? new Date() : null },
      });
    });
    return this.get(userId, id);
  },
  async cancel(userId: string, id: string) {
    await prisma.sharedPlan.updateMany({
      where: { id, creatorId: userId, status: { in: ['PENDING', 'ACTIVE'] } },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    return this.get(userId, id);
  },
};
