import { Prisma } from '@prisma/client';
import type {
  AcceptRecommendationResult,
  LibraryItem,
  Recommendation,
  RecommendationPage,
} from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { catalogService } from '../catalog/catalog.service.js';
import { recommendationsRepository } from './recommendations.repository.js';
import type { RecommendationQuery } from './recommendations.schemas.js';
type RecommendationRecord = {
  id: string;
  externalId: number;
  mediaType: string;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  status: 'PENDING' | 'ACCEPTED';
  createdAt: Date;
  acceptedAt: Date | null;
  sender?: { username: string | null; displayName: string; avatarUrl: string | null };
  recipient?: { username: string | null; displayName: string; avatarUrl: string | null };
};
const person = (user: {
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
}) => ({ username: user.username!, displayName: user.displayName, avatarUrl: user.avatarUrl });
const toRecommendation = (item: RecommendationRecord, direction?: string): Recommendation => ({
  id: item.id,
  provider: 'tmdb',
  externalId: item.externalId,
  mediaType: item.mediaType as Recommendation['mediaType'],
  title: item.title,
  posterUrl: item.posterUrl,
  releaseYear: item.releaseYear,
  status: item.status,
  createdAt: item.createdAt.toISOString(),
  acceptedAt: item.acceptedAt?.toISOString() ?? null,
  ...(direction === 'received' && item.sender ? { sender: person(item.sender) } : {}),
  ...(direction === 'sent' && item.recipient ? { recipient: person(item.recipient) } : {}),
});
const toLibraryItem = (item: {
  id: string;
  provider: string;
  externalId: number | null;
  mediaType: string;
  status: LibraryItem['status'];
  title: string;
  originalTitle: string | null;
  originalLanguage: string | null;
  nationality: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  releaseYear: number | null;
  genreIds: number[];
  manualCategories: string[];
  watchedAt: Date | null;
  personalRating: { toNumber(): number } | null;
  privateComment: string | null;
  createdAt: Date;
  updatedAt: Date;
}): LibraryItem => ({
  id: item.id,
  provider: item.provider as LibraryItem['provider'],
  externalId: item.externalId,
  mediaType: item.mediaType as LibraryItem['mediaType'],
  status: item.status,
  title: item.title,
  originalTitle: item.originalTitle,
  originalLanguage: item.originalLanguage,
  nationality: item.nationality,
  synopsis: item.synopsis,
  posterUrl: item.posterUrl,
  releaseYear: item.releaseYear,
  genreIds: item.genreIds,
  manualCategories: item.manualCategories as LibraryItem['manualCategories'],
  watchedAt: item.watchedAt?.toISOString() ?? null,
  personalRating: item.personalRating?.toNumber() ?? null,
  privateComment: item.privateComment,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});
export const recommendationsService = {
  async create(
    senderId: string,
    input: {
      recipientUsername: string;
      provider: 'tmdb';
      externalId: number;
      mediaType: 'movie' | 'tv';
    },
  ) {
    const recipient = await recommendationsRepository.findRecipient(
      input.recipientUsername.toLowerCase(),
    );
    if (!recipient) throw new AppError(404, ErrorCode.NOT_FOUND, 'Recipient was not found');
    if (recipient.id === senderId)
      throw new AppError(
        400,
        ErrorCode.VALIDATION_ERROR,
        'You cannot recommend content to yourself',
      );
    const content = await catalogService.detail({ type: input.mediaType, id: input.externalId });
    try {
      return toRecommendation(
        await recommendationsRepository.create({
          senderId,
          recipientId: recipient.id,
          provider: input.provider,
          externalId: input.externalId,
          mediaType: input.mediaType,
          title: content.title,
          posterUrl: content.posterUrl,
          releaseYear: content.releaseYear,
        }),
        'sent',
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new AppError(
          409,
          ErrorCode.DUPLICATE_RECOMMENDATION,
          'You have already recommended this title to this user',
        );
      throw error;
    }
  },
  async list(userId: string, query: RecommendationQuery): Promise<RecommendationPage> {
    const [items, totalResults] = await recommendationsRepository.list(userId, query);
    return {
      results: items.map((item) => toRecommendation(item, query.direction)),
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(totalResults / query.pageSize)),
      totalResults,
    };
  },
  async accept(userId: string, id: string): Promise<AcceptRecommendationResult> {
    const result = await recommendationsRepository.accept(id, userId);
    if (!result) throw new AppError(404, ErrorCode.NOT_FOUND, 'Recommendation was not found');
    return {
      recommendation: toRecommendation(result.recommendation, 'received'),
      libraryItem: toLibraryItem(result.libraryItem),
      created: result.created,
    };
  },
  async reject(userId: string, id: string) {
    const result = await recommendationsRepository.reject(id, userId);
    if (!result.count)
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Pending recommendation was not found');
  },
};
