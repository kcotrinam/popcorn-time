export type CatalogMediaType = 'movie' | 'tv';
export type CatalogProvider = 'tmdb';

export type CatalogCard = {
  provider: CatalogProvider;
  externalId: number;
  mediaType: CatalogMediaType;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  externalRating: number | null;
  voteCount: number;
  genreIds: number[];
};

export type CatalogGenre = { id: number; name: string };
export type CatalogCredit = { name: string; role: string; profileUrl: string | null };

export type CatalogDetail = CatalogCard & {
  alternativeTitles: string[];
  genres: CatalogGenre[];
  runtimeMinutes: number | null;
  numberOfEpisodes: number | null;
  numberOfSeasons: number | null;
  status: string | null;
  originCountries: string[];
  originalLanguage: string | null;
  credits: CatalogCredit[];
};

export type CatalogPage = {
  results: CatalogCard[];
  page: number;
  totalPages: number;
  totalResults: number;
};
