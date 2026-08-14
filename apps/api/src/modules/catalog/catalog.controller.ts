import type { RequestHandler } from 'express';
import { catalogService } from './catalog.service.js';
import {
  detailParamsSchema,
  tvSeasonParamsSchema,
  tvSeasonsParamsSchema,
  discoverQuerySchema,
  genresQuerySchema,
  searchQuerySchema,
} from './catalog.schemas.js';

type CatalogController = {
  search: RequestHandler;
  discover: RequestHandler;
  genres: RequestHandler;
  detail: RequestHandler;
  seasons: RequestHandler;
  seasonEpisodes: RequestHandler;
};

export const catalogController: CatalogController = {
  search: (async (req, res) =>
    res.json(
      await catalogService.search(searchQuerySchema.parse(req.query)),
    )) satisfies RequestHandler,
  discover: (async (req, res) =>
    res.json(
      await catalogService.discover(discoverQuerySchema.parse(req.query)),
    )) satisfies RequestHandler,
  genres: (async (req, res) =>
    res.json({
      results: await catalogService.genres(genresQuerySchema.parse(req.query)),
    })) satisfies RequestHandler,
  detail: (async (req, res) =>
    res.json(
      await catalogService.detail(detailParamsSchema.parse(req.params)),
    )) satisfies RequestHandler,
  seasons: (async (req, res) =>
    res.json(
      await catalogService.seasons(tvSeasonsParamsSchema.parse(req.params)),
    )) satisfies RequestHandler,
  seasonEpisodes: (async (req, res) =>
    res.json(
      await catalogService.seasonEpisodes(tvSeasonParamsSchema.parse(req.params)),
    )) satisfies RequestHandler,
};
