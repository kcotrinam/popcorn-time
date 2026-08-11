import { Prisma } from '@prisma/client';
import type { LibraryItem, LibraryMembershipResponse, LibraryPage } from '@popcorn-time/shared';
import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { catalogService } from '../catalog/catalog.service.js';
import { libraryRepository } from './library.repository.js';
import type {
  CreateLibraryItemInput,
  CreateManualLibraryItemInput,
  LibraryItemParams,
  LibraryMembershipQuery,
  LibraryQuery,
  SaveLibraryExperienceInput,
  UpdateLibraryItemInput,
} from './library.schemas.js';

type UserMediaSnapshot = {
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
  personalRating: Prisma.Decimal | null;
  privateComment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const normalizeCatalogTitle = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

const isExactTitleMatch = (
  title: string,
  item: { title: string; originalTitle: string | null },
) => {
  const normalized = normalizeCatalogTitle(title);
  return (
    normalizeCatalogTitle(item.title) === normalized ||
    (item.originalTitle !== null && normalizeCatalogTitle(item.originalTitle) === normalized)
  );
};

const toItem = (item: UserMediaSnapshot): LibraryItem => ({
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
  personalRating: item.personalRating === null ? null : Number(item.personalRating),
  privateComment: item.privateComment,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
});

export const libraryService = {
  async create(userId: string, input: CreateLibraryItemInput) {
    const existing = await libraryRepository.findExisting(userId, input);
    if (existing) return { item: toItem(existing), created: false };
    const catalogItem = await catalogService.detail({
      type: input.mediaType,
      id: input.externalId,
    });
    const item = await libraryRepository.create({
      userId,
      provider: input.provider,
      externalId: input.externalId,
      mediaType: input.mediaType,
      title: catalogItem.title,
      posterUrl: catalogItem.posterUrl,
      releaseYear: catalogItem.releaseYear,
      genreIds: catalogItem.genreIds,
    });
    return { item: toItem(item), created: true };
  },
  async createManual(userId: string, input: CreateManualLibraryItemInput): Promise<LibraryItem> {
    const catalog = await catalogService.search({
      query: input.title,
      type: input.mediaType,
      page: 1,
    });
    const exactMatches = catalog.results.filter((item) => isExactTitleMatch(input.title, item));
    const confirmedMatches = input.releaseYear
      ? exactMatches.filter((item) => item.releaseYear === input.releaseYear)
      : exactMatches;
    if (confirmedMatches.length === 1) {
      const match = confirmedMatches[0];
      if (match)
        throw new AppError(409, ErrorCode.CATALOG_EXACT_MATCH, 'Matching catalog content exists', {
          mediaType: match.mediaType,
          externalId: match.externalId,
          title: match.title,
        });
    }
    if (confirmedMatches.length > 1)
      throw new AppError(409, ErrorCode.CATALOG_AMBIGUOUS_MATCH, 'Multiple catalog matches exist', {
        query: input.title,
        mediaType: input.mediaType,
      });
    const watchedAt = input.status === 'WATCHED' ? new Date() : null;
    return toItem(
      await libraryRepository.create({
        userId,
        provider: 'manual',
        externalId: null,
        mediaType: input.mediaType,
        status: input.status,
        title: input.title,
        originalTitle: input.originalTitle ?? null,
        originalLanguage: input.originalLanguage ?? null,
        nationality: input.nationality ?? null,
        synopsis: input.synopsis ?? null,
        posterUrl: input.posterUrl ?? null,
        releaseYear: input.releaseYear ?? null,
        genreIds: [],
        manualCategories: input.categories,
        watchedAt,
      }),
    );
  },
  async list(userId: string, query: LibraryQuery): Promise<LibraryPage> {
    const [items, totalResults] = await libraryRepository.list(userId, query);
    return {
      results: items.map(toItem),
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(totalResults / query.pageSize)),
      totalResults,
    };
  },
  async memberships(
    userId: string,
    query: LibraryMembershipQuery,
  ): Promise<LibraryMembershipResponse> {
    const items = await libraryRepository.findMemberships(userId, query);
    return {
      results: items.map((item) => ({
        libraryItemId: item.id,
        externalId: item.externalId as number,
        mediaType: item.mediaType as LibraryItem['mediaType'],
        status: item.status,
        watchedAt: item.watchedAt?.toISOString() ?? null,
        personalRating: item.personalRating === null ? null : Number(item.personalRating),
        privateComment: item.privateComment,
      })),
    };
  },
  async update(userId: string, params: LibraryItemParams, input: UpdateLibraryItemInput) {
    const item = await libraryRepository.findOwned(userId, params.id);
    if (!item) throw new AppError(404, ErrorCode.NOT_FOUND, 'Library item was not found');
    const watchedAt =
      input.status === item.status
        ? item.watchedAt
        : input.status === 'WATCHED'
          ? new Date()
          : null;
    return toItem(await libraryRepository.updateStatus(item.id, input.status, watchedAt));
  },
  async saveExperience(
    userId: string,
    params: LibraryItemParams,
    input: SaveLibraryExperienceInput,
  ) {
    const item = await libraryRepository.findOwned(userId, params.id);
    if (!item) throw new AppError(404, ErrorCode.NOT_FOUND, 'Library item was not found');
    return toItem(
      await libraryRepository.saveExperience(item.id, {
        rating: input.rating ?? null,
        comment: input.comment ?? null,
        watchedAt: input.watchedAt,
      }),
    );
  },
  async remove(userId: string, params: LibraryItemParams) {
    const item = await libraryRepository.findOwned(userId, params.id);
    if (!item) throw new AppError(404, ErrorCode.NOT_FOUND, 'Library item was not found');
    await libraryRepository.delete(item.id);
  },
};
