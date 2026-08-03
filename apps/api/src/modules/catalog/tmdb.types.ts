export type TmdbMediaType = 'movie' | 'tv';
export type TmdbResult = {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
};
export type TmdbPage = {
  page: number;
  total_pages: number;
  total_results: number;
  results: TmdbResult[];
};
export type TmdbGenre = { id: number; name: string };
export type TmdbGenresResponse = { genres: TmdbGenre[] };
export type TmdbDetail = TmdbResult & {
  genres?: TmdbGenre[];
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  production_countries?: Array<{ iso_3166_1?: string }>;
  origin_country?: string[];
  original_language?: string;
  credits?: {
    cast?: Array<{ name?: string; character?: string; job?: string; profile_path?: string | null }>;
  };
  alternative_titles?: { titles?: Array<{ title?: string }> };
};
