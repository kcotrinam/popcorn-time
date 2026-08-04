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
  createdAt: Date;
  updatedAt: Date;
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
  async remove(userId: string, params: LibraryItemParams) {
    const item = await libraryRepository.findOwned(userId, params.id);
    if (!item) throw new AppError(404, ErrorCode.NOT_FOUND, 'Library item was not found');
    await libraryRepository.delete(item.id);
  },
};
